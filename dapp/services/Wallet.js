(
  function () {
    angular
    .module('multiSigWeb')
    .service('Wallet', function ($window, $http, $q, $rootScope, $uibModal, Utils, ABI, Connection) {

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
        updates: 0,
        mergedABI: []
      };

      wallet.webInitialized = $q(function (resolve, reject) {
        window.addEventListener('load', function () {
          // Set web3 provider (Metamask, mist, etc)
          if ($window && $window.web3) {
            wallet.web3 = new Web3($window.web3.currentProvider);
          }
          else {
            wallet.web3 = new Web3(new Web3.providers.HttpProvider(txDefault.ethereumNode));
            // Check connection
            wallet.web3.net.getListening(function(e){
              if (e) {
                Utils.dangerAlert("You are not connected to any node.");
                reject();
              }
            });
          }
          resolve();
        });
      });

      wallet.addMethods = function (abi) {
        abi.map(function(item){
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
      };

      wallet.mergedABI = wallet.json.multiSigDailyLimit.abi.concat(wallet.json.multiSigDailyLimitFactory.abi).concat(wallet.json.token.abi);

      // Concat cached abis
      var cachedABIs = ABI.get();
      Object.keys(cachedABIs).map(function(key) {
        //console.log(cachedABIs[key])
        wallet.mergedABI = wallet.mergedABI.concat(cachedABIs[key].abi);
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


      /**
      * Return tx object, with default values, overwritted by passed params
      **/
      wallet.txDefaults = function (tx) {
        var txParams = {
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gas: EthJS.Util.intToHex(wallet.txParams.gasLimit),
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
          to: address,
          value: EthJS.Util.intToHex(0),
          gasPrice: EthJS.Util.intToHex(wallet.txParams.gasPrice),
          gasLimit: EthJS.Util.intToHex(wallet.txParams.gasLimit),
          nonce: nonce?nonce:EthJS.Util.intToHex(wallet.txParams.nonce),
          data: data
        };

        var tx = new EthJS.Tx(txInfo);

        // Get transaction hash
        var txId = EthJS.Util.bufferToHex(tx.hash(false));

        // Sign transaction hash
        wallet.web3.eth.sign(wallet.coinbase, txId, function (e, sig) {
          if (e) {
            cb(e);
          }
          else {
            var signature = EthJS.Util.fromRpcSig(sig);
            tx.v = EthJS.Util.intToHex(signature.v);
            tx.r = EthJS.Util.bufferToHex(signature.r);
            tx.s = EthJS.Util.bufferToHex(signature.s);

            // Return raw transaction as hex string
            cb(null, EthJS.Util.bufferToHex(tx.serialize()));
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

      /**
      * Get ethereum accounts and update account list.
      */
      wallet.updateAccounts = function (cb) {
        return wallet.web3.eth.getAccounts.request(
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
        return wallet.web3.eth.getTransactionCount.request(
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
        return wallet.web3.eth.getGasPrice.request(
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
        return wallet.web3.eth.getBlock.request(
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
      };

      // Init txParams
      wallet.initParams = function () {
        return $q(function (resolve) {
            var batchAccount = wallet.web3.createBatch();
            var batch = wallet.web3.createBatch();
            batchAccount.add(
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

              )
            );
            batchAccount.execute();

          }
        );

      };

      wallet.updateWallet = function (w) {
        if (!wallet.wallets[w.address]) {
          wallet.wallets[w.address] = {};
        }
        var tokens = {};
        if (w.tokens) {
          var tokenAddresses = Object.keys(w.tokens);
          tokenAddresses.map(function (item) {
            var token = w.tokens[item];
            tokens[token.address] = {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              address: token.address
            };
          });
        }

        // Converts to lowercase the addresses
        var owners = {};
        for (var key in w.owners) {
          w.owners[key].address = w.owners[key].address.toLowerCase();
          owners[key.toLowerCase()] = w.owners[key];
        }

        Object.assign(wallet.wallets[w.address], {address: w.address, name: w.name, owners: owners, tokens: tokens});
        localStorage.setItem("wallets", JSON.stringify(wallet.wallets));
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
                  name : owners[ownerKeys[y]] ? owners[ownerKeys[y]] : '',
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
          var abiAddresses = Object.keys(validJsonConfig.abis)
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
            if (e) {
              cb(e);
            }
          }
        );
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

      wallet.deployWithLimitFactory = function (owners, requiredConfirmations, limit, cb) {
        var walletFactory = wallet.web3.eth.contract(wallet.json.multiSigDailyLimitFactory.abi).at(txDefault.walletFactoryAddress);

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
        var factory = wallet.web3.eth.contract(wallet.json.multiSigDailyLimitFactory.abi).at(txDefault.walletFactoryAddress);

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
        return wallet.web3.eth.getBalance.request(address, cb);
      };

      wallet.restore = function (info, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(info.address);
        // Check contract function works
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
              var coinbase = wallet.coinbase.toLowerCase();
              info.owners = {};
              info.owners[coinbase] = { address: wallet.coinbase.toLowerCase(), name: 'My Account'};
              console.log(info);
              wallet.updateWallet(info);
              cb(null, info);
            }
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
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, count, wallet.txDefaults(), cb);
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
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, count, wallet.txDefaults(), cb);
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
      wallet.replaceOwner = function (address, owner, newOwner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        var data = instance.replaceOwner.getData(owner, newOwner);

        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, count, wallet.txDefaults(), cb);
          }
        }).call();
      };

      /**
      * Sign replace owner offline
      **/
      wallet.replaceOwnerOffline = function (address, owner, newOwner, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, count, wallet.txDefaults(), cb);
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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            instance.submitTransaction(address, "0x0", data, count, wallet.txDefaults(), cb);
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
      wallet.confirmTransaction = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.confirmTransaction(
          txId,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Sign confirm transaction offline by another wallet owner
      */
      wallet.confirmTransactionOffline = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);

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
      wallet.executeTransaction = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.executeTransaction(
          txId,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Signs transaction for execute multisig transaction, must be already signed by required owners
      */
      wallet.executeTransactionOffline = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);

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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        return wallet.callRequest(
          instance.confirmations,
          [txId, wallet.coinbase],
          cb
        );
      };

      /**
      * Revoke transaction confirmation
      */
      wallet.revokeConfirmation = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        instance.revokeConfirmation(
          txId,
          wallet.txDefaults(),
          cb
        );
      };

      /**
      * Revoke transaction confirmation offline
      */
      wallet.revokeConfirmationOffline = function (address, txId, cb) {
        var instance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
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
      wallet.submitTransaction = function (address, tx, abi, method, params, cb) {
        var data = '0x0';
        if (abi && method) {
          var instance = wallet.web3.eth.contract(abi).at(tx.to);
          data = instance[method].getData.apply(this, params);
        }
        var walletInstance = wallet.web3.eth.contract(wallet.json.multiSigDailyLimit.abi).at(address);
        // Get nonce
        wallet.getTransactionCount(address, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
            walletInstance.submitTransaction(
              tx.to,
              tx.value,
              data,
              count,
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
            case "e20056e6":
              return "Replace owner";
            case "a9059cbb":
              if ( wallet.wallets[tx.from] && wallet.wallets[tx.from].tokens && wallet.wallets[tx.from].tokens[tx.to]) {
                return "Withdraw " + wallet.wallets[tx.from].tokens[tx.to].symbol;
              }
              else {
                return "Withdraw " + tx.to.slice(0, 12) + "...";
              }
              break;

            default:
              var abis = ABI.get();
              if(abis[tx.to] && abis[tx.to].name) {
                return abis[tx.to].name;
              }
              else {
                return tx.to.slice(0, 20) + "...";
              }
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

      // Works as observer triggering for watch $scope
      wallet.triggerUpdates = function () {
        wallet.updates++;
      };

      /**
      * Returns a list of comprehensive logs, decoded from a list of encoded logs
      * Needs the abi to decode them
      **/
      wallet.decodeLogs = function (logs) {

        var decoded = [];
        var i = 0;
        while(i<logs.length){
          // Event hash matches
          var id = logs[i].topics[0].slice(2);
          var method = wallet.methodIds[id];
          if(method){
            var logData = logs[i].data;
            var decodedParams = [];
            var dataIndex = 2;
            var topicsIndex = 1;
            // Loop topic and data to get the params
            method.inputs.map(function (param) {
              var decodedP = {
                name: param.name
              };

              if (param.indexed) {
                decodedP.value = logs[i].topics[topicsIndex];
                topicsIndex++;
              }
              else {
                var dataEndIndex = dataIndex + 64;
                decodedP.value = "0x" + logData.slice(dataIndex, dataEndIndex);
                dataIndex = dataEndIndex;
              }

              if (param.type == "address"){
                decodedP.value = "0x" + new Web3().toBigNumber(decodedP.value).toString(16);
              }
              else if(param.type == "uint256" || param.type == "uint8" || param.type == "int" ){
                decodedP.value = new Web3().toBigNumber(decodedP.value).toString(10);
              }

              decodedParams.push(decodedP);
            });

            decoded.push(
              {
                name: method.name,
                info: decodedParams
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
