(
  function(){
    angular
    .module('multiSigWeb')
    .service('Wallet', function($window, $http, $q, $rootScope){

      // Init wallet factory object
      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")),
        web3 : null,
        json : null,
        txParams: {
          nonce: null,
          gasPrice: null,
          gasLimit: null
        }
      }

      // Set web3 provider (Metamask, mist, etc)
      if($window.web3){
        wallet.web3 = new Web3($window.web3.currentProvider);
      }

      // ABI/HEX file, only loaded when needed
      wallet.loadJson = function(){
        if(!wallet.json){
          return $http
          .get('/abi.json')
          .then(function(json){
            wallet.json = json.data;
          });
        }
        else{
          return $q(function(resolve, reject){
            resolve(wallet.json);
          });
        }
      }

      /**
      * Return eth_call request object.
      * custom method .call() for direct calling.
      */
      wallet.callRequest = function(method, params, cb){

        // Add to params the callback
        var methodParams = params.slice();
        methodParams.push(cb);

        // Get request object
        var request = method.request.apply(method, methodParams);
        // Add .call function
        request.call = function(){
          var batch = wallet.web3.createBatch();

          batch.add(
            method.request.apply(method, methodParams)
          );
          batch.execute();
        }
        return request;
      }

      /**
      * Get ethereum accounts and update account list.
      */
      wallet.updateAccounts = function(cb){
        return wallet.callRequest(
          wallet.web3.eth.getAccounts,
          [],
          function(e, accounts){
            if(e){
              cb(e);
            }
            else{
              wallet.accounts = accounts;
              wallet.coinbase = accounts?accounts[0]:null;
              cb(null, accounts);
            }
          }
        );
      }

      wallet.updateNonce = function(address, cb){
        return wallet.callRequest(
          wallet.web3.eth.getTransactionCount,
          [address],
          function(e, count){
            if(e){
              cb(e);
            }
            else{
              wallet.txParams.nonce = count;
              cb(null, count);
            }
          }
        );
      }

      wallet.updateGasPrice = function(cb){
        return wallet.callRequest(
          wallet.web3.eth.getGasPrice,
          [],
          function(e, gasPrice){
            if(e){
              cb(e);
            }
            else{
              wallet.txParams.gasPrice = gasPrice;
              cb(null, gasPrice);
            }
          }
        );
      }

      wallet.updateGasLimit = function(cb){
        return wallet.callRequest(
          wallet.web3.eth.getBlock,
          ["latest"],
          function(e, block){
            if(e){
              cb(e);
            }
            else{
              wallet.txParams.gasLimit = Math.floor(block.gasLimit*0.9);
              cb(null, block.gasLimit);
            }
          }
        );
      }

      // Init txParams
      wallet.initParams = function(){
        return $q(function(resolve, reject){
          var batch = wallet.web3.createBatch();
          wallet
          .updateAccounts(
            function(e, accounts){
              var promises = $q.all(
                [
                  $q(function(resolve, reject){
                    batch.add(
                      wallet.updateGasLimit(function(e){
                        if(e){
                          reject(e);
                        }
                        else{
                          resolve();
                        }
                      })
                    );
                  }),
                  $q(function(resolve, reject){
                    batch.add(
                      wallet.updateGasPrice(function(e){
                        if(e){
                          reject(e);
                        }
                        else{
                          resolve();
                        }
                      })
                    );
                  }),
                  $q(function(resolve, reject){
                    batch.add(
                      wallet.updateNonce(accounts[0], function(e){
                        if(e){
                          reject(e);
                        }
                        else{
                          resolve();
                        }
                      })
                    );
                  })
                ]
              ).then(function(){
                resolve();
              });

              batch.execute();
              return promises;
            }

          ).call();
          });
        }

      wallet.addWallet = function(w){
        var walletCollection = JSON.parse(localStorage.getItem("wallets"));
        if (!walletCollection) walletCollection = {}
        walletCollection[w.address] = w;
        localStorage.setItem("wallets", JSON.stringify(walletCollection));
        wallet.wallets = walletCollection;
        try{
          $rootScope.$digest();
        }
        catch(e){

        }
      }

      wallet.removeWallet = function(address){
        delete wallet.wallets[address];

        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        try{
          $rootScope.$digest();
        }
        catch(e){

        }
      }

      // Deploy wallet contract with constructor params
      wallet.deployWallet = function(owners, requiredConfirmations, cb){
        wallet.loadJson()
        .then(
          function(){
            var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
            MyContract.new(owners, requiredConfirmations, {
              data: wallet.json.multiSigWallet.binHex
            }, cb);
          }
        )

      }

      // Sign transaction, don't send it
      wallet.deployOfflineWallet = function(owners, requiredConfirmations, cb){
        wallet.loadJson()
        .then(
          function(){
            // Get Transaction Data
            var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
            var data = MyContract.new.getData(owners, requiredConfirmations, {
              data: wallet.json.multiSigWallet.binHex
            });

            // Create transaction object
            var txInfo = {
              to: null,
              value: EthJS.Util.intToHex(0),
              gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
              gasLimit: EthJS.Util.intToHex(wallet.txParams.gasLimit),
              nonce: EthJS.Util.intToHex(wallet.txParams.nonce),
              data: data
            }

            var tx = new EthJS.Tx(txInfo);

            // Get transaction hash
            var txHash = EthJS.Util.bufferToHex(tx.hash(false));

            // Sign transaction hash
            wallet.web3.eth.sign(wallet.coinbase, txHash, function(e, signature){
              if(e){
                cb(e);
              }
              var signature = EthJS.Util.fromRpcSig(signature);
              tx.v = EthJS.Util.intToHex(signature.v);
              tx.r = EthJS.Util.bufferToHex(signature.r);
              tx.s = EthJS.Util.bufferToHex(signature.s);

              // Return raw transaction as hex string
              cb(null, EthJS.Util.bufferToHex(tx.serialize()));
            });

          }
        )

      }

      wallet.getBalance = function(address, cb){
        return wallet.callRequest(
          wallet.web3.eth.getBalance,
          [address],
          cb
        );
      };

      wallet.restore = function(info, cb){
        wallet.loadJson()
        .then(
          function(){
            var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(info.address);
            // Check contract function works
            instance.MAX_OWNER_COUNT(function(e, count){
              if(e){
                cb(e);
              }

              if(count.eq(0)){
                // it is not a wallet
                cb("Address " + info.address + " is not a MultiSigWallet contract");
              }
              else{
                // Add wallet
                wallet.addWallet(info);
                cb(info);
              }
            });
          }
        );
      };

      // MultiSig functions

      /**
      * Get wallet owners
      * Needs to call loadJson before
      */
      wallet.getOwners = function(address, index, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.owners,
          [index],
          cb
        )
      }

      /**
      * add owner to wallet
      */
      wallet.addOwner = function(address, owner, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        var data = instance.addOwner.getData(owner.address);

        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function(e, nonce){
          if(e){
            cb(e);
          }
          else{
            // Add owner to owners collection TODO
            instance.submitTransaction(address, "0x0", data, nonce, cb);
          }
        }).call();

      }

      /**
      * Get nonces
      */
      wallet.getNonces = function(address, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.nonces,
          [],
          cb
        )
      }

      /**
      * Get nonce
      */
      wallet.getNonce = function(address, to, value, data, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.getNonce,
          [to, value, data],
          cb
        );
      }

      /**
      * Get required confirmations number
      */
      wallet.getRequired = function(address, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.required,
          [],
          cb
        )
      }

      /**
      * Update confirmations
      */
      wallet.updateRequired = function(address, required, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        var data = instance.changeRequirement.getData(required);

        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function(e, nonce){
          if(e){
            cb(e);
          }
          else{
            instance.submitTransaction(address, "0x0", data, nonce, cb);
          }
        }).call();
      }

      /**
      * Sign transaction offline
      */
      wallet.signUpdateRequired = function(address, required, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        var data = instance.changeRequirement.getData(required);

        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function(e, nonce){
          if(e){
            cb(e);
          }
          else{
            var mainData = instance.submitTransaction.getData(address, "0x0", data, nonce, cb);
            // Create transaction object
            var txInfo = {
              to: address,
              value: EthJS.Util.intToHex(0),
              gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
              gasLimit: EthJS.Util.intToHex(wallet.txParams.gasLimit),
              nonce: EthJS.Util.intToHex(wallet.txParams.nonce),
              data: mainData
            }

            var tx = new EthJS.Tx(txInfo);

            // Get transaction hash
            var txHash = EthJS.Util.bufferToHex(tx.hash(false));

            // Sign transaction hash
            wallet.web3.eth.sign(wallet.coinbase, txHash, function(e, signature){
              if(e){
                cb(e);
              }
              else{
                var signature = EthJS.Util.fromRpcSig(signature);
                tx.v = EthJS.Util.intToHex(signature.v);
                tx.r = EthJS.Util.bufferToHex(signature.r);
                tx.s = EthJS.Util.bufferToHex(signature.s);

                // Return raw transaction as hex string
                cb(null, EthJS.Util.bufferToHex(tx.serialize()));
              }
            });
          }
        }).call();
      }

      /**
      * Get pending transactions
      */
      wallet.getPendingTransactions = function(address, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.getPendingTransactions,
          [address],
          cb
        );
      }

      /**
      * Get executed transactions hashes
      */
      wallet.getExecutedTransactions = function(address, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.getExecutedTransactions,
          [address],
          cb
        );
      }

      /**
      * Get transaction
      */
      wallet.getTransaction = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txHash],
          function(e, tx){
            // convert to object
            cb(
              e,
              {
                to: tx[0],
                value: tx[1].toNumber(),
                data: tx[2],
                nonce: tx[3].toNumber(),
                executed: tx[4]
              }
            );
          }
        );
      }

      return wallet;
    });
  }
)();
