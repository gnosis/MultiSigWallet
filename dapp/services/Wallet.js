(
  function () {
    angular
    .module('multiSigWeb')
    .service('Wallet', function ($window, $http, $q, $rootScope, $uibModal, Utils, ABI, Connection, Web3Service) {

      // Init wallet factory object
      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")) || {},
        json : abiJSON,
        txParams: {
          nonce: null,
          gasPrice: txDefault.gasPrice,
          gasLimit: txDefault.gasLimit,
          confirmAddGas: txDefault.confirmAddGas
        },
        accounts: [],
        methodIds: {},
        updates: 0,
        mergedABI: []
      };

      wallet.addMethods = function (abi) {
        abiDecoder.addABI(abi);
      };

      wallet.mergedABI = Object.keys(wallet.json).map(key => wallet.json[key].abi).reduce((accAbiArray, currentAbiArray) => {
        return accAbiArray.concat(currentAbiArray)
      })

      // Concat cached abis
      var cachedABIs = ABI.get();
      Object.keys(cachedABIs).map(function(key) {
        if (cachedABIs[key].abi) {
          wallet.mergedABI = wallet.mergedABI.concat(cachedABIs[key].abi);
        }
      });

      // Generate event id's
      wallet.addMethods(wallet.mergedABI);


      /**
      * Returns all the wallets saved in the
      * Browser localStorage
      */
      wallet.getAllWallets = function () {
        try {
          return JSON.parse(localStorage.getItem("wallets")) || {};
        } catch (error) {
          return {};
        }
      };

      wallet.getGasPrice = function () {
        return $q(
          function(resolve, reject){
            Web3Service.web3.eth.getGasPrice(
              function (e, gasPrice) {
                if (e) {
                  reject(e);
                }
                else {
                  resolve(gasPrice);
                }
              }
            );
          }
        );
      };


      /**
      * Return tx object, with default values, overwritted by passed params
      **/
      wallet.txDefaults = function (tx) {
        var txParams = {
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gas: EthJS.Util.intToHex(wallet.txParams.gasLimit),
          confirmAddGas: wallet.txParams.confirmAddGas,
          confirmAddGasHex: EthJS.Util.intToHex(wallet.txParams.confirmAddGas),
          from: Web3Service.coinbase
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
        request.call = function () {
            method.call.apply(method, methodParams);
        };
        return Object.assign({}, request, {
          method: 'eth_call',
          params: [
            {
              to: request.params[0].to,
              data: request.params[0].data
            },
            "latest"
          ]
        });
      };

      /**
      * For a given address and data, sign a transaction offline
      */
      wallet.offlineTransaction = function (address, data, nonce, cb) {
        // Create transaction object
        var txInfo = {
          from: Web3Service.coinbase,
          to: address,
          value: EthJS.Util.intToHex(0),
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gas: EthJS.Util.intToHex(wallet.txParams.gasLimit),
          nonce: nonce?nonce:EthJS.Util.intToHex(wallet.txParams.nonce),
          data: data
        };

        Web3Service.web3.eth.signTransaction(txInfo, function(e, signed) {
          if (e) {
            cb(e);
          }
          else{
            cb(e, signed.raw);
          }
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

      wallet.updateNonce = function (address, cb) {
        return Web3Service.web3.eth.getTransactionCount.request(
          address,
          "pending",
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
        if (Connection.isConnected) {
          return Web3Service.web3.eth.getGasPrice.request(
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
        }
        else {
          cb(null, txDefault.gasPrice);
        }
      };

      wallet.updateGasLimit = function (cb) {
        if (Connection.isConnected) {
          return Web3Service.web3.eth.getBlock.request(
            "latest",
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
        }
        else {
          cb(null, txDefault.gasLimit);
        }
      };

      // Init txParams
      wallet.initParams = function () {
        return $q(function (resolve, reject) {
            var batch = Web3Service.web3.createBatch();
            Web3Service
            .updateAccounts(
              function (e, accounts) {
                var promises = $q.all(
                  [
                    $q(function (resolve, reject) {
                      var request = wallet.updateGasLimit(function (e) {
                        if (e) {
                          reject(e);
                        }
                        else {
                          resolve();
                        }
                      });
                      if (request) {
                        batch.add(request);
                      }
                    }),
                    $q(function (resolve, reject) {
                      var request = wallet.updateGasPrice(function (e) {
                        if (e) {
                          reject(e);
                        }
                        else {
                          resolve();
                        }
                      });
                      if (request) {
                        batch.add(request);
                      }
                    }),
                    $q(function (resolve, reject) {
                      if (Web3Service.coinbase) {
                        batch.add(
                          wallet.updateNonce(Web3Service.coinbase, function (e) {
                            if (e) {
                              reject(e);
                            }
                            else {
                              resolve();
                            }
                          })
                        );
                      }
                      else {
                        resolve();
                      }
                    }),
                    $q(function (resolve, reject) {
                      if (Web3Service.coinbase) {
                        batch.add(
                          wallet.getBalance(Web3Service.coinbase, function (e, balance) {
                            if (e) {
                              reject(e);
                            }
                            else {
                              wallet.balance = balance;
                              resolve();
                            }
                          })
                        );
                      }
                      else {
                        resolve();
                      }
                    })
                  ]
                ).then(function () {
                  resolve();
                }, reject);

                batch.execute();
                return promises;
              }

            );
          }
        );

      };

      wallet.updateWallet = function (w) {
        var wallets = wallet.getAllWallets();
        var address = w.address.toLowerCase();
        if (!wallets[address]) {
          wallets[address] = {};
        }
        var tokens = {};
        if (w.tokens) {
          var tokenAddresses = Object.keys(w.tokens);
          tokenAddresses.map(function (item) {
            var token = w.tokens[item];
            tokens[token.address.toLowerCase()] = {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              address: token.address.toLowerCase()
            };
          });
        }

        // Converts the addresses to lower case
        var owners = {};
        for (var key in w.owners) {
          w.owners[key].address = w.owners[key].address.toLowerCase();
          owners[key.toLowerCase()] = w.owners[key];
        }

        Object.assign(wallets[address], {address: address, name: w.name, owners: owners, tokens: tokens});
        localStorage.setItem("wallets", JSON.stringify(wallets));
        wallet.updates++;
        try{
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Creates and returns the valid configuration for Import/Export purposes
      * @param jsonConfig
      * @param operation 'import' | 'export'
      */
      wallet.getValidConfigFromJSON = function (jsonConfig, operation) {
        /* JSON structure based on the following one
        *
        *  {
        *    "wallets" : {
        *      "wallet_address": {
        *        "name": "wallet_name",
        *        "address" : "wallet_address",
        *        "owners": {
        *          "address": "owner_address",
        *          "name" : "owner_name"
        *        },
        *        "tokens":{
        *           "token_address":{
        *              "address":"token_address",
        *              "name":"token_name",
        *              "symbol":"token_symbol",
        *              "decimals":token_decimals
        *           }
        *        }
        *      }
        *    },
        *    "abis" : {
        *        "address" : [ abi array ]
        *    }
        *  }
        *
        */

        if(jsonConfig === {} || jsonConfig === ''){
          return {};
        }

        // Create th valid JSON input structure
        var validJsonConfig = {};
        validJsonConfig.wallets = {};
        validJsonConfig.abis = {};

        if (!angular.equals(jsonConfig.abis, {})) {
            validJsonConfig.abis = jsonConfig.abis;
        }
        else {
          delete validJsonConfig.abis;
        }

        if (!angular.equals(jsonConfig.wallets, {})) {

          var walletKeys = Object.keys(jsonConfig.wallets);
          var ownerKeys;
          var tokenKeys;

          for (var x=0; x<walletKeys.length; x++) {
            var owners = jsonConfig.wallets[walletKeys[x]].owners;
            var tokens = jsonConfig.wallets[walletKeys[x]].tokens || [];
            var validOwners = {};
            var validTokens = {};

            // Get tokens and owner keys
            tokenKeys = Object.keys(tokens);
            ownerKeys = Object.keys(owners);

            // Construct the valid JSON structure
            validJsonConfig.wallets[walletKeys[x]] = {
              name : jsonConfig.wallets[walletKeys[x]].name,
              owners : {},
              tokens : {}
            };

            // Add address key => value pair only when importing
            // configuration to adapt it to the App JSON Structure
            if (operation == 'import') {
              validJsonConfig.wallets[walletKeys[x]].address = walletKeys[x];
            }

            // Populate owners object
            for (var y=0; y<ownerKeys.length; y++) {

              if (operation == 'import') {
                validOwners[ownerKeys[y]] = {
                  name : owners[ownerKeys[y]] ? owners[ownerKeys[y]] : 'Owner '  (y+1),
                  address : ownerKeys[y]
                };
              } else {
                validOwners[ownerKeys[y]] = owners[ownerKeys[y]].name ? owners[ownerKeys[y]].name : '';
              }

            }

            Object.assign(validJsonConfig.wallets[walletKeys[x]].owners, validOwners);
            // Populate tokens object
            for (var k=0; k<tokenKeys.length; k++) {

              validTokens[tokenKeys[k]] = {
                name : tokens[tokenKeys[k]].name,
                symbol : tokens[tokenKeys[k]].symbol,
                decimals : tokens[tokenKeys[k]].decimals
              };

              if (operation == 'import') {
                validTokens[tokenKeys[k]].address = tokenKeys[k];
              }

              Object.assign(validJsonConfig.wallets[walletKeys[x]].tokens, validTokens);

            }
          }
        }
        else {
          delete validJsonConfig.wallets;
        }

        return validJsonConfig;
      };

      /**
      * Imports a JSON configuration script containing
      * the wallet or wallets declarations
      */
      wallet.import = function (jsonConfig) {
        // Setting up new configuration
        // No data validation at the moment
        var walletsData = JSON.parse(localStorage.getItem("wallets")) || {};
        var abisData = ABI.get();
        var validJsonConfig = wallet.getValidConfigFromJSON(JSON.parse(jsonConfig), 'import');
        // Object.assign doesn't create a new key => value pair if
        // the key already exists, so at the moment we execute the
        // entire JSON object returning OK to the user.
        Object.assign(walletsData, validJsonConfig.wallets);
        localStorage.setItem("wallets", JSON.stringify(walletsData));

        // Update abis if the key exists in the configuration object
        if (validJsonConfig.abis !== undefined) {
          var abiAddresses = Object.keys(validJsonConfig.abis);
          for (var x=0; x<abiAddresses.length; x++) {
            ABI.update(validJsonConfig.abis[abiAddresses[x]].abi, abiAddresses[x], validJsonConfig.abis[abiAddresses[x]].name);
          }
        }

        wallet.wallets = walletsData;
        wallet.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      wallet.removeWallet = function (address) {
        var wallets = wallet.getAllWallets();
        delete wallets[address];
        localStorage.setItem("wallets", JSON.stringify(wallets));
        wallet.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      wallet.update = function (address, name) {
        var wallets = wallet.getAllWallets();
        wallets[address].name = name;
        localStorage.setItem("wallets", JSON.stringify(wallets));
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
            if (e) {
              cb(e);
            }
          }
        );
      };

      wallet.deployWithLimit = function (owners, requiredConfirmations, limit, cb) {
        var MyContract = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);

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

      wallet.deployWithLimitFactory = function (owners, requiredConfirmations, limit, cb) {
        var walletFactory = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimitFactory.abi).at(txDefault.walletFactoryAddress);

        walletFactory.create(
          owners,
          requiredConfirmations,
          limit,
          wallet.txDefaults({
            data: wallet.json.multiSigDailyLimit.binHex
          }),
          cb
        );
      };

      wallet.deployWithLimitFactoryOffline = function (owners, requiredConfirmations, limit, cb) {
        var factory = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimitFactory.abi).at(txDefault.walletFactoryAddress);

        var data = factory.create.getData(
          owners,
          requiredConfirmations,
          limit
        );

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            wallet.offlineTransaction(txDefault.walletFactoryAddress, data, nonce, cb);
          }
        });
      };

      /**
      * Deploy wallet with daily limit
      **/

      wallet.deployWithLimitOffline = function (owners, requiredConfirmations, limit, cb) {
        // Get Transaction Data
        var MyContract = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi);
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
        return Web3Service.web3.eth.getBalance.request(address, cb);
      };

      wallet.restore = function (info, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(info.address);
        // Check contract function works
        try {
          instance.MAX_OWNER_COUNT(function (e, count) {
            if (e && Connection.isConnected) {
              cb(e);
            }
            else {
              if ((!count && Connection.isConnected) || (count && count.eq(0) && Connection.isConnected)) {
                // it is not a wallet
                cb("Address " + info.address + " is not a wallet contract");
              }
              else {
                // Add wallet, add My account to the object by default, won't be
                // displayed anyway if user is not an owner, but if it is, name will be used
                if (Web3Service.coinbase) {
                  var coinbase = Web3Service.coinbase.toLowerCase();
                  info.owners = {};
                  info.owners[coinbase] = { address: coinbase, name: 'My Account'};
                }
                wallet.updateWallet(info);
                cb(null, info);
              }
            }
          });
        }
        catch (err) {
          cb(err);
        }
      };

      // MultiSig functions

      /**
      * Get wallet owners
      */
      wallet.getOwners = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getOwners,
          [],
          cb
        );
      };

      /**
      * add owner to wallet
      */
      wallet.addOwner = function (address, owner, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.addOwner.getData(owner.address);

        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              instance.submitTransaction,
              [
                address,
                "0x0",
                data,
                count,
                wallet.txDefaults()
              ],
              options,
              cb
            );
          }
        }).call();
      };

      /**
      * Sign offline Add owner transaction
      */
      wallet.addOwnerOffline = function (address, owner, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.addOwner.getData(owner.address);
        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Get add owner transaction data
      **/
      wallet.getAddOwnerData = function (address, owner) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.addOwner.getData(owner.address);
      };

      /**
      * Remove owner
      */
      wallet.removeOwner = function (address, owner, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.removeOwner.getData(owner.address);
        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              instance.submitTransaction,
              [
                address,
                "0x0",
                data,
                count,
                wallet.txDefaults()
              ],
              options,
              cb
            );
          }
        }).call();
      };

      /**
      * Get remove owner data
      **/
      wallet.getRemoveOwnerData = function (address, owner) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.removeOwner.getData(owner.address);
      };

      /**
      * Sign offline remove owner transaction
      **/
      wallet.removeOwnerOffline = function (address, owner, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.removeOwner.getData(owner.address);
        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Replace owner
      **/
      wallet.replaceOwner = function (address, owner, newOwner, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.replaceOwner.getData(owner, newOwner);

        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              instance.submitTransaction,
              [
                address,
                "0x0",
                data,
                count,
                wallet.txDefaults()
              ],
              options,
              cb
            );
          }
        }).call();
      };

      /**
      * Sign replace owner offline
      **/
      wallet.replaceOwnerOffline = function (address, owner, newOwner, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.replaceOwner.getData(owner, newOwner);
        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Get required confirmations number
      */
      wallet.getRequired = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.required,
          [],
          cb
        );
      };

      /**
      * Update confirmations
      */
      wallet.updateRequired = function (address, required, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeRequirement.getData(required);

        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              instance.submitTransaction,
              [
                address,
                "0x0",
                data,
                count,
                wallet.txDefaults()
              ],
              options,
              cb
            );
          }
        }).call();
      };

      wallet.getUpdateRequiredData = function (address, required) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.changeRequirement.getData(required);
      };

      /**
      * Sign transaction offline
      */
      wallet.signUpdateRequired = function (address, required, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeRequirement.getData(required);
        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Get transaction hashes
      */
      wallet.getTransactionIds = function (address, from, to, pending, executed, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getTransactionIds,
          [from, to, pending, executed],
          cb
        );
      };

      /**
      * Get transaction
      */
      wallet.getTransaction = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txId],
          function (e, tx) {
            // convert to object
            cb(
              e,
              {
                to: tx[0],
                value: "0x" + tx[1].toString(16),
                data: tx[2],
                id: txId,
                executed: tx[3]
              }
            );
          }
        );
      };

      /**
      * Get confirmations
      */
      wallet.getConfirmations = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getConfirmations,
          [txId],
          cb
        );
      };

      /**
      * Get transaction count
      **/
      wallet.getTransactionCount = function (address, pending, executed, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.getTransactionCount,
          [pending, executed],
          function (e, count) {
            if (e) {
              cb(e);
            }
            else {
              cb(null, count);
            }
          }
        );
      };

      /**
      * Get daily limit
      **/
      wallet.getLimit = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.calcMaxWithdraw,
          [],
          cb
        );
      };

      /**
      * Change daily limit
      **/
      wallet.updateLimit = function (address, limit, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeDailyLimit.getData(
          limit,
          cb
        );
        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              instance.submitTransaction,
              [
                address,
                "0x0",
                data,
                count,
                wallet.txDefaults()
              ],
              options,
              cb
            );
          }
        }).call();
      };

      /**
      * Get update limit transaction data
      **/
      wallet.getUpdateLimitData = function (address, limit) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return instance.changeDailyLimit.getData(limit);
      };

      /**
      * Sign update limit transaction
      **/
      wallet.signLimit = function (address, limit, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.changeDailyLimit.getData(
          limit,
          cb
        );

        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.submitTransaction.getData(address, "0x0", data);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Confirm transaction by another wallet owner
      */
      wallet.confirmTransaction = function (address, txId, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var defaults = wallet.txDefaults()
        Web3Service.web3.eth.estimateGas({
          from: defaults.from,
          to: address,
          data: instance.confirmTransaction.getData(txId)
        }, function (err, gas) {
          if(defaults.confirmAddGas) {
           console.log("adding gas: ", defaults.confirmAddGas)
           console.log("computed gas: ", gas)
           console.log("total gas: ", gas + defaults.confirmAddGas)
          }
          Web3Service.sendTransaction(
            instance.confirmTransaction,
            [
              txId,
              {
                gasPrice: defaults.gasPrice,
                gas: gas + defaults.confirmAddGas,
                from: defaults.from
              }
            ],
            options,
            cb
          );
        })
      };

      /**
      * Sign confirm transaction offline by another wallet owner
      */
      wallet.confirmTransactionOffline = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.confirmTransaction.getData(txId);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Execute multisig transaction, must be already signed by required owners
      */
      wallet.executeTransaction = function (address, txId, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        Web3Service.sendTransaction(
          instance.executeTransaction,
          [
            txId,
            wallet.txDefaults()
          ],
          options,
          cb
        );
      };

      /**
      * Signs transaction for execute multisig transaction, must be already signed by required owners
      */
      wallet.executeTransactionOffline = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);

        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = instance.executeTransaction.getData(txId);
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      /**
      * Get confirmation count
      */
      wallet.confirmationCount = function (txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.transactions,
          [txId],
          function (e, count) {
            if (e) {
              cb(e);
            }
            else {
              cb(null, count);
            }
          }
        );
      };

      /**
      * Get confirmations
      */
      wallet.isConfirmed = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.confirmations,
          [txId, Web3Service.coinbase],
          cb
        );
      };

      /**
      * Revoke transaction confirmation
      */
      wallet.revokeConfirmation = function (address, txId, options, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        Web3Service.sendTransaction(
          instance.revokeConfirmation,
          [
            txId,
            wallet.txDefaults()
          ],
          options,
          cb
        );
      };

      /**
      * Revoke transaction confirmation offline
      */
      wallet.revokeConfirmationOffline = function (address, txId, cb) {
        var instance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var data = instance.revokeConfirmation.getData(txId);
            wallet.offlineTransaction(address, data, nonce, cb);
          }
        });
      };

      /**
      * Submit transaction
      **/
      wallet.submitTransaction = function (address, tx, abi, method, params, options, cb) {
        var data = '0x0';
        if (abi && method) {
          var instance = Web3Service.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            Web3Service.sendTransaction(
              walletInstance.submitTransaction,
              [
                tx.to,
                tx.value,
                data,
                count,
                wallet.txDefaults(),
              ],
              options,
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
          var instance = Web3Service.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = Web3Service.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        // Get nonce
        wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else if (nonce === undefined){
            // Don's show anything, user closed the modal
          }
          else {
            var mainData = walletInstance.submitTransaction.getData(
              tx.to,
              tx.value,
              data
            );
            wallet.offlineTransaction(address, mainData, nonce, cb);
          }
        });
      };

      // Works as observer triggering for watch $scope
      wallet.triggerUpdates = function () {
        wallet.updates++;
      };

      /**
      * Returns a list of comprehensive logs, decoded from a list of encoded logs
      * Needs the abi to decode them
      **/
      wallet.decodeLogs = function (logs) {
        return abiDecoder.decodeLogs(logs);
      };

      return wallet;
    });
  }
)();
