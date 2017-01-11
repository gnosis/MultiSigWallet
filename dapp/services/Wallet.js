(
  function () {
    angular
    .module('multiSigWeb')
    .service('Wallet', function ($window, $http, $q, $rootScope, $uibModal, Utils) {

      // Init wallet factory object
      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")) || {},
        web3 : null,
        json : abiJSON,
        txParams: {
          nonce: null,
          gasPrice: txDefault.gasPrice,
          gasLimit: txDefault.gasLimit
        },
        accounts: [],
        coinbase: null,
        methodIds: {},
        updates: 0
      };

      wallet.webInitialized = $q(function (resolve, reject) {
        window.addEventListener('load', function () {
          // Set web3 provider (Metamask, mist, etc)
          if ($window.web3) {
            wallet.web3 = new Web3($window.web3.currentProvider);
          }
          else {
            wallet.web3 = new Web3(new Web3.providers.HttpProvider(txDefault.ethereumNode));
            // Check connection
            wallet.web3.net.getListening(function(e){
              if (e) {
                Utils.dangerAlert("You are not connected to any node.")
                reject();
              }
            });
          }
          resolve();
        });
      });

      // Generate event id's
      wallet.json.multiSigDailyLimit.abi.map(function(item){
        if(item.name){
          var signature = new Web3().sha3(item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")");
          if(item.type == "event"){
            wallet.methodIds[signature.slice(2)] = item;
          }
          else{
            wallet.methodIds[signature.slice(2, 6)] = item;
          }
        }
      });


      /**
      * Returns all the wallets saved in the
      * Browser localStorage
      */
      wallet.getAllWallets = function () {
        return JSON.parse(localStorage.getItem("wallets") || {});
      };


      /**
      * Return tx object, with default values, overwritted by passed params
      **/
      wallet.txDefaults = function (tx) {
        var txParams = {
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gas: EthJS.Util.intToHex(wallet.txParams.gasLimit),
          nonce: EthJS.Util.intToHex(wallet.txParams.nonce),
          from: wallet.coinbase
        };

        Object.assign(txParams, tx);
        return txParams;
      };

      /**
      * Return eth_call request object.
      * custom method .call() for direct calling.
      */
      wallet.callRequest = function (method, params, cb) {

        // Add to params the callback
        var methodParams = params.slice();
        methodParams.push(cb);

        // Get request object
        var request = method.request.apply(method, methodParams);
        // Add .call function
        request.call = function () {
          var batch = wallet.web3.createBatch();

          batch.add(
            method.request.apply(method, methodParams)
          );
          batch.execute();
        };
        return request;
      };

      /**
      * For a given address and data, sign a transaction offline
      */
      wallet.offlineTransaction = function (address, data, nonce, cb) {
        // Create transaction object
        var txInfo = {
          to: address,
          value: EthJS.Util.intToHex(0),
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gasLimit: EthJS.Util.intToHex(wallet.txParams.gasLimit),
          nonce: nonce?nonce:EthJS.Util.intToHex(wallet.txParams.nonce),
          data: data
        };

        var tx = new EthJS.Tx(txInfo);

        // Get transaction hash
        var txHash = EthJS.Util.bufferToHex(tx.hash(false));

        // Sign transaction hash
        wallet.web3.eth.sign(wallet.coinbase, txHash, function (e, sig) {
          if (e) {
            cb(e);
          }
          var signature = EthJS.Util.fromRpcSig(sig);
          tx.v = EthJS.Util.intToHex(signature.v);
          tx.r = EthJS.Util.bufferToHex(signature.r);
          tx.s = EthJS.Util.bufferToHex(signature.s);

          // Return raw transaction as hex string
          cb(null, EthJS.Util.bufferToHex(tx.serialize()));
        });

      };

      /**
      * Get multisig nonce
      **/
      wallet.getWalletNonces = function (cb) {
        $uibModal
        .open(
          {
            animation: false,
            templateUrl: 'partials/modals/signMultisigTransactionOffline.html',
            size: 'md',
            controller: "signMultisigTransactionOfflineCtrl"
          }
        )
        .result
        .then(
          function (nonce) {
            cb(null, nonce);
          },
          function (e) {
            cb(e);
          }
        );
      };

      /**
      * Get ethereum accounts and update account list.
      */
      wallet.updateAccounts = function (cb) {
        return wallet.callRequest(
          wallet.web3.eth.getAccounts,
          [],
          function (e, accounts) {
            if (e) {
              cb(e);
            }
            else {
              wallet.accounts = accounts;

              if (wallet.coinbase && accounts.indexOf(wallet.coinbase) != -1) {
                // same coinbase
              }
              else if (accounts) {
                  wallet.coinbase = accounts[0];
              }
              else {
                wallet.coinbase = null;
              }

              cb(null, accounts);
            }
          }
        );
      };

      /**
      * Select account
      **/
      wallet.selectAccount = function (account) {
        wallet.coinbase = account;
      };

      wallet.updateNonce = function (address, cb) {
        return wallet.callRequest(
          wallet.web3.eth.getTransactionCount,
          [address],
          function (e, count) {
            if (e) {
              cb(e);
            }
            else {
              wallet.txParams.nonce = count;
              cb(null, count);
            }
          }
        );
      };

      wallet.updateGasPrice = function (cb) {
        return wallet.callRequest(
          wallet.web3.eth.getGasPrice,
          [],
          function (e, gasPrice) {
            if (e) {
              cb(e);
            }
            else {
              wallet.txParams.gasPrice = gasPrice.toNumber();
              cb(null, gasPrice);
            }
          }
        );
      };

      wallet.updateGasLimit = function (cb) {
        return wallet.callRequest(
          wallet.web3.eth.getBlock,
          ["latest"],
          function (e, block) {
            if (e) {
              cb(e);
            }
            else {
              wallet.txParams.gasLimit = Math.floor(block.gasLimit*0.9);
              cb(null, block.gasLimit);
            }
          }
        );
      };

      // Init txParams
      wallet.initParams = function () {
        return $q(function (resolve) {
            var batch = wallet.web3.createBatch();
            wallet
            .updateAccounts(
              function (e, accounts) {
                var promises = $q.all(
                  [
                    $q(function (resolve, reject) {
                      batch.add(
                        wallet.updateGasLimit(function (e) {
                          if (e) {
                            reject(e);
                          }
                          else {
                            resolve();
                          }
                        })
                      );
                    }),
                    $q(function (resolve, reject) {
                      batch.add(
                        wallet.updateGasPrice(function (e) {
                          if (e) {
                            reject(e);
                          }
                          else {
                            resolve();
                          }
                        })
                      );
                    }),
                    $q(function (resolve, reject) {
                      batch.add(
                        wallet.updateNonce(wallet.coinbase, function (e) {
                          if (e) {
                            reject(e);
                          }
                          else {
                            resolve();
                          }
                        })
                      );
                    }),
                    $q(function (resolve, reject) {
                      batch.add(
                        wallet.getBalance(wallet.coinbase, function (e, balance) {
                          if (e) {
                            reject(e);
                          }
                          else {
                            wallet.balance = balance;
                            resolve();
                          }
                        })
                      );
                    })
                  ]
                ).then(function () {
                  resolve();
                });

                batch.execute();
                return promises;
              }

            ).call();
          }
        );

      };

      wallet.updateWallet = function (w) {
        if (!wallet.wallets[w.address]) {
          wallet.wallets[w.address] = {};
        }
        Object.assign(wallet.wallets[w.address], {address: w.address, name: w.name, owners: w.owners, tokens: w.tokens});
        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        wallet.updates++;
        try{
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Imports a JSON configuration script containing
      * the wallet or wallets declarations
      */
      wallet.import = function (jsonConfig){
        // Setting up new configuration
        // No data validation at the moment
        var walletsData = JSON.parse(localStorage.getItem("wallets")) || {};
        // Object.assign doesn't create a new key => value pair if
        // the key already exists, so at the moment we execute the
        // entire JSON object returning OK to the user.
        Object.assign(walletsData, JSON.parse(jsonConfig));
        localStorage.setItem("wallets", JSON.stringify(walletsData));

        wallet.wallets = walletsData;
        wallet.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      wallet.removeWallet = function (address) {
        delete wallet.wallets[address];
        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        wallet.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      wallet.update = function (address, name) {
        wallet.wallets[address].name = name;
        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
        wallet.updates++;
        try{
          $rootScope.$digest();
        }
        catch(e) {}
      };

      /**
      * Get ethereum account nonce with text input prompted to the user
      **/
      wallet.getUserNonce = function (cb) {
        $uibModal
        .open(
          {
            animation: false,
            templateUrl: 'partials/modals/signOffline.html',
            size: 'md',
            controller: "signOfflineCtrl"
          }
        )
        .result
        .then(
          function (nonce) {
            cb(null, nonce);
          },
          function (e) {
            cb(e);
          }
        );
      };

      // Deploy wallet contract with constructor params
      wallet.deployWallet = function (owners, requiredConfirmations, cb) {
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);
        MyContract.new(owners, requiredConfirmations, {
          data: wallet.json.multiSigDailyLimit.binHex
        }, cb);
      };

      wallet.deployWithLimit = function (owners, requiredConfirmations, limit, cb) {
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);

        MyContract.new(
          owners,
          requiredConfirmations,
          limit,
          wallet.txDefaults({
            data: wallet.json.multiSigDailyLimit.binHex
          }),
          cb
        );
      };

      /**
      * Deploy wallet with daily limit
      **/

      // Sign transaction, don't send it
      wallet.deployOfflineWallet = function (owners, requiredConfirmations, cb) {

        // Get Transaction Data
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);
        var data = MyContract.new.getData(owners, requiredConfirmations, {
          data: wallet.json.multiSigDailyLimit.binHex
        });

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(null, data, nonce, cb);
          }
        });

      };

      wallet.deployWithLimitOffline = function (owners, requiredConfirmations, limit, cb) {
        // Get Transaction Data
        var MyContract = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);
        var data = MyContract.new.getData(owners, requiredConfirmations, limit, {
          data: wallet.json.multiSigDailyLimit.binHex
        });

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(null, data, nonce, cb);
          }
        });
      };

      wallet.getBalance = function (address, cb) {
        return wallet.callRequest(
          wallet.web3.eth.getBalance,
          [address],
          cb
        );
      };

      wallet.restore = function (info, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(info.address);
        // Check contract function works
        instance.MAX_OWNER_COUNT(function (e, count) {
          if (e) {
            cb(e);
          }
          if (count.eq(0)) {
            // it is not a wallet
            cb("Address " + info.address + " is not a MultiSigWallet contract");
          }
          else {
            // Add wallet
            info.owners = {};
            wallet.updateWallet(info);
            cb(null, info);
          }
        });
      };

      // MultiSig functions

      /**
      * Get wallet owners
      */
      wallet.getOwners = function (address, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getOwners,
          [],
          cb
        );
      };

      /**
      * add owner to wallet
      */
      wallet.addOwner = function (address, owner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.addOwner.getData(owner.address);

        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, nonce, wallet.txDefaults(), function (e, tx) {
              if (e) {
                cb(e);
              }
              else {
                cb(null, tx);
              }
            });
          }
        }).call();
      };

      /**
      * Sign offline Add owner transaction
      */
      wallet.addOwnerOffline = function (address, owner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.addOwner.getData(owner.address);
        // Get nonce
        wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data, nonces.multisig, wallet.txDefaults());
            wallet.offlineTransaction(address, mainData, nonces.account, cb);
          }
        });
      };

      /**
      * Get add owner transaction data
      **/
      wallet.getAddOwnerData = function (address, owner) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.addOwner.getData(owner.address);
      };

      /**
      * Remove owner
      */
      wallet.removeOwner = function (address, owner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.removeOwner.getData(owner.address);
        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, nonce, wallet.txDefaults(), cb);
          }
        }).call();
      };

      /**
      * Get remove owner data
      **/
      wallet.getRemoveOwnerData = function (address, owner) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.removeOwner.getData(owner.address);
      };

      /**
      * Sign offline remove owner transaction
      **/
      wallet.removeOwnerOffline = function (address, owner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.removeOwner.getData(owner.address);
        // Get nonce
        wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data, nonces.multisig, wallet.txDefaults());
            wallet.offlineTransaction(address, mainData, nonces.account, cb);
          }
        });
      };

      /**
      * Get nonces
      */
      wallet.getNonces = function (address, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.nonces,
          [],
          cb
        );
      };

      /**
      * Get nonce
      */
      wallet.getNonce = function (address, to, value, data, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getNonce,
          [to, value, data],
          cb
        );
      };

      /**
      * Get required confirmations number
      */
      wallet.getRequired = function (address, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.required,
          [],
          cb
        );
      };

      /**
      * Update confirmations
      */
      wallet.updateRequired = function (address, required, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeRequirement.getData(required);

        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, nonce, wallet.txDefaults(), cb);
          }
        }).call();
      };

      wallet.getUpdateRequiredData = function (address, required) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.changeRequirement.getData(required);
      };

      /**
      * Sign transaction offline
      */
      wallet.signUpdateRequired = function (address, required, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeRequirement.getData(required);
        // Get nonce
        wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data, nonces.multisig, cb);
            wallet.offlineTransaction(address, mainData, nonces.account, cb);
          }
        });
      };

      /**
      * Get transaction hashes
      */
      wallet.getTransactionHashes = function (address, from, to, pending, executed, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getTransactionHashes,
          [from, to, pending, executed],
          cb
        );
      };

      /**
      * Get transaction
      */
      wallet.getTransaction = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txHash],
          function (e, tx) {
            // convert to object
            cb(
              e,
              {
                to: tx[0],
                value: "0x" + tx[1].toString(16),
                data: tx[2],
                nonce: tx[3].toNumber(),
                executed: tx[4]
              }
            );
          }
        );
      };

      /**
      * Get confirmations
      */
      wallet.getConfirmations = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getConfirmations,
          [txHash],
          cb
        );
      };

      /**
      * Get transaction count
      **/
      wallet.getTransactionCount = function (address, pending, executed, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getTransactionCount,
          [pending, executed],
          function (e, count) {
            if (e) {
              cb(e);
            }
            else {
              cb(null, count.toNumber());
            }
          }
        );
      };

      /**
      * Get daily limit
      **/
      wallet.getLimit = function (address, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.dailyLimit,
          [],
          cb
        );
      };

      /**
      *
      **/
      wallet.calcMaxWithdraw = function (address, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.calcMaxWithdraw,
          [],
          cb
        );
      };

      /**
      * Change daily limit
      **/
      wallet.updateLimit = function (address, limit, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeDailyLimit.getData(
          limit,
          cb
        );
        // Get nonce
        wallet.getNonce(address, address, "0x0", data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, nonce, wallet.txDefaults(), cb);
          }
        }).call();
      };

      /**
      * Get update limit transaction data
      **/
      wallet.getUpdateLimitData = function (address, limit) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.changeDailyLimit.getData(limit);
      };

      /**
      * Sign update limit transaction
      **/
      wallet.signLimit = function (address, limit, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeDailyLimit.getData(
          limit,
          cb
        );

        // Get nonce
        wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data, nonces.multisig, cb);
            wallet.offlineTransaction(address, mainData, nonces.account, cb);
          }
        });
      };

      /**
      * Confirm transaction by another wallet owner
      */
      wallet.confirmTransaction = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.confirmTransaction(
          txHash,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Sign confirm transaction offline by another wallet owner
      */
      wallet.confirmTransactionOffline = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var mainData = instance.confirmTransaction.getData(txHash);

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Execute multisig transaction, must be already signed by required owners
      */
      wallet.executeTransaction = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.executeTransaction(
          txHash,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Signs transaction for execute multisig transaction, must be already signed by required owners
      */
      wallet.executeTransactionOffline = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var mainData = instance.executeTransaction.getData(txHash);

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Get confirmation count
      */
      wallet.confirmationCount = function (txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txHash],
          function (e, count) {
            if (e) {
              cb(e);
            }
            else {
              cb(null, count.toNumber());
            }
          }
        );
      };

      /**
      * Get confirmations
      */
      wallet.isConfirmed = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.confirmations,
          [txHash, wallet.coinbase],
          cb
        );
      };

      /**
      * Revoke transaction confirmation
      */
      wallet.revokeConfirmation = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.revokeConfirmation(
          txHash,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Revoke transaction confirmation offline
      */
      wallet.revokeConfirmationOffline = function (address, txHash, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.revokeConfirmation.getData(txHash);
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(address, data, nonce, cb);
          }
        });
      };

      /**
      * Submit transaction
      **/
      wallet.submitTransaction = function (address, tx, abi, method, params, cb) {
        var data = '0x0';
        if (abi && method) {
          var instance = wallet.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        // Get nonce
        wallet.getNonce(address, tx.to, tx.value, data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            walletInstance.submitTransaction(
              tx.to,
              tx.value,
              data,
              nonce,
              wallet.txDefaults(),
              cb
            );
          }
        }).call();
      };

      /**
      * Sign offline multisig transaction
      **/
      wallet.signTransaction = function (address, tx, abi, method, params, cb) {
        var data = '0x0';
        if (abi && method) {
          var instance = wallet.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        // Get nonce
        wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else if (nonces == undefined){
            // Don's show anything, user closed the modal
          }
          else {
            var mainData = walletInstance.submitTransaction.getData(
              tx.to,
              tx.value,
              data,
              nonces.multisig,
              wallet.txDefaults()
            );
            wallet.offlineTransaction(address, mainData, nonces.account, cb);
          }
        });
      };

      /**
      * Get type of transaction or destination
      **/
      wallet.getType = function (tx) {
        if (tx.data && tx.data.length > 3) {
          var method = tx.data.slice(2, 10);
          switch (method) {
            case "ba51a6df":
              return "Update required confirmations";
            case "7065cb48":
              return "Add owner";
            case "173825d9":
              return "Remove owner";
            case "cea08621":
              return "Update daily limit";
            default:
              return tx.to.slice(0, 20) + "...";
          }
        }
        else {
          if (tx.to) {
            if (wallet.wallets[tx.to] && wallet.wallets[tx.to].name) {
              return wallet.wallets[tx.to].name;
            }
            else {
              return tx.to.slice(0, 20) + "...";
            }
          }
        }
      };

      /**
      * Returns a list of comprehensive logs, decoded from a list of encoded logs
      * Needs the abi to decode them
      **/
      wallet.decodeLogs = function (logs) {
        var i = 0;
        var decoded = [];
        while(i<logs.length){
          // Event hash matches
          var id = logs[i].topics[0].slice(2);
          var method = wallet.methodIds[id];
          if(method){
            var params = logs[i].data;
            decoded.push(
              {
                name: method.name,
                info: ethAbi.decodeEvent(method, params)
              }
            );
          }
          // Doesn't match, we move i
          i++;
        }

        return decoded;
      };

      return wallet;
    });
  }
)();
