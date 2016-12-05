(
  function(){
    angular
    .module('multiSigWeb')
    .service('Wallet', function($window, $http, $q, $rootScope){

      // Init wallet factory object
      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")) || {},
        web3 : null,
        json : abiJSON,
        txParams: {
          nonce: null,
          gasPrice: null,
          gasLimit: null
        },
        accounts: [],
        coinbase: null
      }

      // Set web3 provider (Metamask, mist, etc)
      if($window.web3){
        wallet.web3 = new Web3($window.web3.currentProvider);
      }
      else{
        wallet.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
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
      * For a given address and data, sign a transaction offline
      */
      wallet.offlineTransaction = function(address, data, cb){
        // Create transaction object
        var txInfo = {
          to: address,
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

              if(wallet.coinbase && accounts.indexOf(wallet.coinbase) != -1){
                // same coinbase
              }
              else if(accounts){
                  wallet.coinbase = accounts[0];
              }
              else{
                wallet.coinbase = null;
              }

              cb(null, accounts);
            }
          }
        );
      }

      /**
      * Select account
      **/
      wallet.selectAccount = function(account){
        wallet.coinbase = account;
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
                      wallet.updateNonce(wallet.coinbase, function(e){
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

      wallet.updateWallet = function(w){
        if(!wallet.wallets[w.address]){
          wallet.wallets[w.address] = {};
        }
        Object.assign(wallet.wallets[w.address], {address: w.address, name: w.name});
        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        try{
          $rootScope.$digest();
        }
        catch(e){}
      }

      wallet.removeWallet = function(address){
        delete wallet.wallets[address];

        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        try{
          $rootScope.$digest();
        }
        catch(e){}
      }

      // Deploy wallet contract with constructor params
      wallet.deployWallet = function(owners, requiredConfirmations, cb){
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
        MyContract.new(owners, requiredConfirmations, {
          data: wallet.json.multiSigWallet.binHex
        }, cb);
      }

      // Sign transaction, don't send it
      wallet.deployOfflineWallet = function(owners, requiredConfirmations, cb){

        // Get Transaction Data
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
        var data = MyContract.new.getData(owners, requiredConfirmations, {
          data: wallet.json.multiSigWallet.binHex
        });

        wallet.offlineTransaction(null, data, cb);

      }

      wallet.getBalance = function(address, cb){
        return wallet.callRequest(
          wallet.web3.eth.getBalance,
          [address],
          cb
        );
      };

      wallet.restore = function(info, cb){

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
            cb(null, info);
          }
        });
      }

      // MultiSig functions

      /**
      * Get wallet owners
      */
      wallet.getOwners = function(address, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.getOwners,
          [],
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
            instance.submitTransaction(address, "0x0", data, nonce, function(e, tx){
              if(e){
                cb(e);
              }
              else{
                // Add owner to owners collection
                Owner.update(owner);
                cb(null, tx);
              }
            });
          }
        }).call();

      }

      /**
      * Remove owner
      */
      wallet.removeOwner = function(address, owner, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        var data = instance.removeOwner.getData(owner.address);

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
            wallet.offlineTransaction(address, mainData, cb);
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

      /**
      * Confirm transaction by another wallet owner
      */
      wallet.confirmTransaction = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        instance.confirmTransaction(
          txHash,
          {
            gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
            gas: EthJS.Util.intToHex(wallet.txParams.gasLimit)
          },
          cb
        );
      }

      /**
      * Sign confirm transaction offline by another wallet owner
      */
      wallet.confirmTransactionOffline = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        var mainData = instance.confirmTransaction.getData(txHash);

        wallet.offlineTransaction(address, mainData, cb);
      }

      /**
      * Get confirmation count
      */
      wallet.confirmationCount = function(txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txHash],
          function(e, count){
            if(e){
              cb(e);
            }
            else{
              cb(null, count.toNumber());
            }
          }
        );
      }

      /**
      * Get confirmations
      */
      wallet.isConfirmed = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);
        return wallet.callRequest(
          instance.confirmations,
          [txHash, wallet.coinbase],
          cb
        );
      }

      /**
      * Revoke transaction confirmation
      */
      wallet.revokeConfirmation = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);

        instance.revokeConfirmation(
          txHash,
          {
            gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
            gas: EthJS.Util.intToHex(wallet.txParams.gasLimit)
          },
          cb
        );
      }

      /**
      * Revoke transaction confirmation offline
      */
      wallet.revokeConfirmationOffline = function(address, txHash, cb){
        var instance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);

        var data = instance.revokeConfirmation.getData(txHash);

        wallet.offlineTransaction(address, data, cb);
      }

      /**
      * Submit transaction
      **/
      wallet.submitTransaction = function(address, tx, abi, method, params, cb){
        var data = '0x0';
        if(abi && method){
          var instance = wallet.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);

        // Get nonce
        wallet.getNonce(address, tx.to, tx.value, data, function(e, nonce){
          if(e){
            cb(e);
          }
          else{
            walletInstance.submitTransaction(
              tx.to,
              tx.value,
              data,
              nonce,
              {
                gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
                gas: EthJS.Util.intToHex(wallet.txParams.gasLimit)
              },
              cb
            );
          }
        }).call();
      }

      /**
      * Sign offline multisig transaction
      **/
      wallet.signTransaction = function(address, tx, abi, method, params, cb){
        var data = '0x0';
        if(abi && method){
          var instance = wallet.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi).at(address);

        // Get nonce
        wallet.getNonce(address, tx.to, tx.value, data, function(e, nonce){
          if(e){
            cb(e);
          }
          else{
            var mainData = walletInstance.submitTransaction.getData(
              tx.to,
              tx.value,
              data,
              nonce,
              {
                gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
                gas: EthJS.Util.intToHex(wallet.txParams.gasLimit)
              }
            );

            wallet.offlineTransaction(address, mainData, cb);


          }
        }).call();
      }



      return wallet;
    });
  }
)();
