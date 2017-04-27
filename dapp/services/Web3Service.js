(
  function () {
    angular
    .module('multiSigWeb')
    .service("Web3Service", function ($window, $q, Utils, $uibModal, Connection, Config) {

      factory = {};

      factory.webInitialized = $q(function (resolve, reject) {
        window.addEventListener('load', function () {
          // Ledger wallet
          factory.reloadWeb3Provider(resolve, reject);
        });
      });

      /**
      * Reloads web3 provider
      * @param resolve, function (optional)
      * @param reject, function (optional)
      **/
      factory.reloadWeb3Provider = function (resolve, reject) {
        // Ledger wallet
        if (txDefault.wallet == "ledger" && !isElectron) {
          ledgerwallet(
            {
              rpcUrl: txDefault.ethereumNode,
              onSubmit: function () {
                Utils.showSpinner();
              },
              onSigned: function () {
                Utils.stopSpinner();
              },
              getChainID: function (cb) {
               if (!Connection.isConnected) {
                 if (txDefault.defaultChainID) {
                   cb(null, txDefault.defaultChainID);
                 }
                 else {
                   cb("You must set an offline Chain ID in order to sign offline transactions");
                 }
               }
               else {
                 if (factory.web3) {
                   factory.web3.version.getNetwork(cb);
                 }
                 else {
                   cb("No valid web3 object");
                 }
               }
             }
            }
          ).then(
            function(ledgerWeb3){
              factory.web3 = ledgerWeb3;

              if (resolve) {
                resolve();
              }
              // Open Info Modal
              $uibModal.open({
                templateUrl: 'partials/modals/ledgerHelp.html',
                size: 'md',
                backdrop: 'static',
                windowClass: 'bootstrap-dialog type-info',
                controller: function ($scope, $uibModalInstance) {
                  $scope.ok = function () {
                    $uibModalInstance.close();
                  };

                  $scope.checkCoinbase = function () {
                    if (factory.coinbase) {
                      $uibModalInstance.close();
                    }
                    else {
                      setTimeout($scope.checkCoinbase, 1000);
                    }

                  };

                  $scope.checkCoinbase();
                }
              });
            }
          );
        }
        // injected web3 provider (Metamask, mist, etc)
        else if (txDefault.wallet == "injected" && $window && $window.web3 && !isElectron) {
          factory.web3 = new Web3($window.web3.currentProvider);
          if (resolve) {
            resolve();
          }
        }
        else if (txDefault.wallet == 'lightwallet' && isElectron) {
          factory.lightWalletSetup();
          if (resolve) {
            resolve();
          }
        }
        else {
          // Connect to Ethereum Node
          factory.web3 = new Web3(new Web3.providers.HttpProvider(txDefault.ethereumNode));
          // Check connection
          factory.web3.net.getListening(function(e){
            if (e) {
              Utils.dangerAlert("You are not connected to any node.");
              if (reject) {
                reject();
              }
            }
            else {
              if (resolve) {
                resolve();
              }
            }
          });
        }
      };

      factory.sendTransaction = function (method, params, options, cb) {
        // Simulate first
        function sendIfSuccess(e, result) {
          if (e) {
            cb(e);
          }
          else {
            if (result) {
              method.sendTransaction.apply(method.sendTransaction, params.concat(cb));
            }
            else {
              cb("Simulated transaction failed");
            }
          }
        }

        if ( options && options.onlySimulate) {
          var args = params.concat(cb);
          method.call.apply(method.call, args);
        }
        else {
          var args = params.concat(sendIfSuccess);
          method.call.apply(method.call, args);
        }
      };

      /**
      * Get ethereum accounts and update account list.
      */
      factory.updateAccounts = function (cb) {
        return factory.web3.eth.getAccounts(
          function (e, accounts) {
            if (e) {
              cb(e);
            }
            else {
              factory.accounts = accounts;

              if (factory.coinbase && accounts && accounts.length && accounts.indexOf(factory.coinbase) != -1) {
                // same coinbase
              }
              else if (accounts) {
                  factory.coinbase = accounts[0];
              }
              else {
                factory.coinbase = null;
              }

              cb(null, accounts);
            }
          }
        );
      };

      /**
      * Select account
      **/
      factory.selectAccount = function (account) {
        factory.coinbase = account;
      };

      /**
      * Light wallet vars
      */
      factory.keystore = null;
      factory.addresses = [];

      /**
      * Light wallet setup
      */
      factory.lightWalletSetup = function () {
        factory.password_provider_callback = null;
        factory.engine = new ProviderEngine();
        factory.web3 = new Web3(factory.engine);

        if (factory.getKeystore()) {
          factory.restore();
          // Set HookedWeb3Provider
          var web3Provider = new HookedWeb3Provider({
            getAccounts: function (cb) {
              cb(null, factory.getAddresses());
            },
            approveTransaction: function(txParams, cb) {
              cb(null, true);
            },
            signTransaction: function(txData, cb) {
              // Show password modal
              $uibModal.open({
                templateUrl: 'partials/modals/askLightWalletPassword.html',
                size: 'md',
                backdrop: 'static',
                controller: function ($scope, $uibModalInstance) {

                  $scope.ok = function () {
                    factory.keystore.keyFromPassword($scope.password, function (err, pwDerivedKey) {
                      if (err) throw err;
                      if (factory.keystore.isDerivedKeyCorrect(pwDerivedKey)) {
                        // Password valid
                        txData.gasPrice = parseInt(txData.gasPrice, 16);
                        txData.nonce = parseInt(txData.nonce, 16);
                        txData.gasLimit = txData.gas;

                        var sendingAddress = factory.coinbase;
                        var contractData = lightwallet.txutils.createContractTx(sendingAddress, txData);
                        var signedTx = lightwallet.signing.signTx(factory.keystore, pwDerivedKey, contractData.tx, sendingAddress, "m/44'/60'/0'/0");
                        cb(null, signedTx);
                        $uibModalInstance.close();
                      }
                      else {
                        $uibModalInstance.dismiss();
                        cb('Invalid password', null);
                      }

                    });
                  };

                  $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                    cb('Deploy canceled', null);
                  };

                }
              });
            }
          });

          web3Provider.transaction_signer = factory.keystore;
          web3Provider.host = txDefault.ethereumNode;

          factory.engine.addProvider(web3Provider);

          factory.engine.addProvider(new RpcSubprovider({
            rpcUrl: txDefault.ethereumNode
          }));

          factory.engine.start();
        }
      };

      /**
      * Creates a new keystore and within one account
      */
      factory.createLightWallet = function (password, seed, ctrlCallback) {

        var opts = {
          password: password,
          seedPhrase: seed,
          hdPathString: "m/44'/60'/0'/0"
        };

        lightwallet.keystore.createVault(opts, function(err, ks) {
          if (err) throw err;

          var config = Config.getUserConfiguration();

          // You've got a new vault now.
          ks.keyFromPassword(password, function (err, pwDerivedKey) {
            if (err) throw err;

            ks.generateNewAddress(pwDerivedKey, 1);
            factory.addresses = ks.getAddresses();
            //factory.addresses = addresses[0].startsWith('0x') ? addresses : '0x' + addresses[0];
            factory.setKeystore(ks.serialize());

            ks.passwordProvider = function (callback, pwd) {
              callback(null, pwd);
            };

            factory.lightWalletSetup();

            // Return addresses (in our case just an array containing 1 address)
            ctrlCallback(factory.addresses.map(function (address) {
              // Add 0x prefix to address
              return '0x' + address.replace('0x', '');
            }));

          });
        });
      };

      /**
      * Verify if a provided password can unlock a keystore
      */
      factory.decrypt = function (password, ctrlCallback) {
        var deserializedKeystore = lightwallet.keystore.deserialize(factory.getKeystore());
        deserializedKeystore.keyFromPassword(password, function (err, pwDerivedKey) {
          if (err) throw err;
          if (deserializedKeystore.isDerivedKeyCorrect(pwDerivedKey)) {
            // Password valid
            factory.restore();
            ctrlCallback(true);
          }
          else {
            ctrlCallback(false);
          }

        });
      };

      /**
      * Restore keystore from localStorage
      */
      factory.restore = function () {
        var keystore = factory.getKeystore();
        factory.keystore = lightwallet.keystore.deserialize(keystore);
        factory.addresses = factory.keystore.getAddresses();
      };

      /**
      * Addes a new account
      */
      factory.newAccount = function (password, ctrlCallback) {
        var deserializedKeystore = lightwallet.keystore.deserialize(factory.getKeystore());
        deserializedKeystore.keyFromPassword(password, function (err, pwDerivedKey) {
          if (err) throw err;

          // Verify password is correct
          if (deserializedKeystore.isDerivedKeyCorrect(pwDerivedKey)) {
            // Password valid
            // New address
            // 1st we check whether exist deleted keystore accounts, or rather
            // accounts not in 'accounts' localStorage
            var keystoreAddresses = factory.getAddresses();
            var storageAddresses = Config.getConfiguration('accounts');
            var existingAddressToAdd = null;
            for(var x in keystoreAddresses) {
              var address = keystoreAddresses[x];
              var matchingAddresses = storageAddresses.filter(function (item) {
                return item.address.replace('0x', '') == address.replace('0x', '');
              });

              if (matchingAddresses.length == 0) {
                existingAddressToAdd = address;
                break;
              }
            }

            if (existingAddressToAdd && factory.addresses.indexOf(existingAddressToAdd.replace('0x', '')) == -1) {
              factory.addresses.push(existingAddressToAdd);
              ctrlCallback(existingAddressToAdd);
            }
            if (existingAddressToAdd &&  factory.addresses.indexOf(existingAddressToAdd.replace('0x', '')) !== -1) {
              ctrlCallback(existingAddressToAdd);
            }
            else if (!existingAddressToAdd) {
              deserializedKeystore.generateNewAddress(pwDerivedKey, 1);
              // Add new address to addresses list
              // add 0x prefix to callback address
              factory.addresses.push(deserializedKeystore.getAddresses().slice(-1)[0]);
              factory.setKeystore(deserializedKeystore.serialize());
              ctrlCallback('0x' + deserializedKeystore.getAddresses().slice(-1)[0].replace('0x', ''));
            }
          }
          else {
            ctrlCallback();
          }

        });
      };

      /**
      * Returns keystore string from localStorage
      */
      factory.getKeystore = function () {
        return localStorage.getItem('keystore');
      };

      /**
      * Set keystore localStorage string
      */
      factory.setKeystore = function (value) {
        // check wheter valus is a JSON valid format
        try {
          JSON.parse(value);
          localStorage.setItem('keystore', value);
        }
        catch (err) {
          throw err;
        }
      };

      /**
      * Checks whether input seed is valid or not
      */
      factory.isSeedValid = function (seed) {
        return lightwallet.keystore.isSeedValid(seed);
      };

      factory.generateLightWalletSeed = function () {
        return lightwallet.keystore.generateRandomSeed();
      };

      /**
      * Return accounts list, each prefixed with '0x'
      */
      factory.getAddresses = function () {
        accounts = factory.keystore.getAddresses().map(function(account) {
          if (!account.startsWith('0x')) {
            return '0x' + account;
          }
          return account;
        });

        return accounts;
      };



      return factory;
    });
  }
)();
