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
          // Ask for password
          if (factory.getKeystore()) {

            $uibModal.open({
              templateUrl: 'partials/modals/askLightWalletPassword.html',
              size: 'md',
              backdrop: 'static',
              windowClass: 'bootstrap-dialog type-info',
              controller: function ($scope, $uibModalInstance) {
                $scope.title = 'Unlock your account';
                $scope.password = '';

                $scope.ok = function () {
                  //
                  factory.canDecryptLightWallet($scope.password, function (response) {
                    if (!response) {
                      if (reject) {
                        reject();
                      }

                      Utils.dangerAlert({message: "Invalid password."});
                    }
                    else {
                      factory.lightWalletSetup(true, $scope.password);
                      if (resolve) {
                        resolve();
                      }
                      $uibModalInstance.close();
                    }
                  });
                };

                $scope.cancel = function () {
                  // TODO set remote node
                  $uibModalInstance.dismiss();
                };

              }
            });
          }
          else {
            factory.lightWalletSetup();
            if (resolve) {
              resolve();
            }
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
      * @param passwrod | optional
      */
      factory.lightWalletSetup = function (restore=false, password=null) {
        factory.password_provider_callback = null;
        factory.engine = new ProviderEngine();
        factory.web3 = new Web3(factory.engine);

        if (factory.getKeystore()) {
          if (restore) {
            factory.restoreLightWallet(password);
          }

          // Set HookedWeb3Provider
          var web3Provider = new HookedWeb3Provider({
            getAccounts: function (cb) {
              cb(null, factory.getLightWalletAddresses());
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
                    cb(
                      {
                        toString: function () {
                          return 'User denied';
                        }
                      },
                      null
                    );
                    //cb('Deploy canceled', null);
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

        //var hdEthWallet = hdEthereumWallet.fromMasterSeed(seed);
        //var wallet = ethWallet.getWallet();
        //var address = wallet.getAddressString();
        var jsonKeystore = null;
        var keystore = new hdkeyring({
          mnemonic: seed,
          numberOfAccounts: 1,
        });

        factory.keystore = keystore;
        //jsonKeystore = keystore.hdWallet.getWallet().toV3String(password);
        // Save keystore to localStorage
        factory.keystore.serialize()
        .then(function (serializedKeystore) {
          encryptor.encrypt(password, serializedKeystore)
          .then(function (encryptedString) {
            factory.setKeystore(encryptedString);
            factory.addresses = [factory.keystore.wallets[0].getAddressString()];
            factory.lightWalletSetup(false);
            // Return addresses (in our case just an array containing 1 address)
            ctrlCallback(factory.addresses.map(function (address) {
              // Add 0x prefix to address
              return '0x' + address.replace('0x', '');
            }));
          });
        });

        /*var opts = {
          password: password,
          seedPhrase: seed
          //hdPathString: "m/44'/60'/0'/0/x"
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
        });*/
      };

      /**
      * Verify if a provided password can unlock a keystore
      */
      factory.canDecryptLightWallet = function (password, callback) {
        //var deserializedKeystore = lightwallet.keystore.deserialize(factory.getKeystore());
        encryptor.decrypt(password, factory.getKeystore())
        .then(function (decryptedKeystore) {
          var keystore = new hdkeyring();
          keystore.deserialize(decryptedKeystore);
          keystore.hdWallet.getWallet().toV3(password);

          callback(true);
        })
        .catch(function (error) {
          callback(false);
        });


        /*deserializedKeystore.keyFromPassword(password, function (err, pwDerivedKey) {
          if (err) throw err;
          if (deserializedKeystore.isDerivedKeyCorrect(pwDerivedKey)) {
            // Password valid
            factory.restore();
            ctrlCallback(true);
          }
          else {
            ctrlCallback(false);
          }

        });*/
      };

      /**
      * Restore keystore from localStorage
      * @param password,
      */
      factory.restoreLightWallet = function (password) {
        factory.addresses = [];
        if (factory.getKeystore() && password) {
          try {
            encryptor.decrypt(password, factory.getKeystore())
            .then(function (decryptedString) {
              factory.keystore = new hdkeyring();
              factory.keystore.deserialize(decryptedString);

              factory.keystore.wallets.map(function (address) {
                factory.addresses.push('0x' + address.getAddressString().replace('0x', ''));
              });
            });
          }
          catch (error) {
            Utils.dangerAlert({message: "Invalid password."});
          }
        }
        else if (factory.getKeystore()) {
          Config.getConfiguration('accounts').map(function (account) {
            factory.addresses.push('0x' + account.address.replace('0x', ''));
          });
        }
      };

      /**
      * Addes a new account
      * @param password
      * @param callback
      */
      factory.newLightWalletAccount = function (password, ctrlCallback) {

        factory.canDecryptLightWallet(password, function (response) {
          if (!response) {
            ctrlCallback();
          }
          else {
            var keystoreAddresses = factory.getLightWalletAddresses();
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
              factory.keystore.addAccounts();
              // Add new address to addresses list
              // add 0x prefix to callback address

              factory.keystore.serialize()
              .then(function (serializedKeystore) {
                encryptor.encrypt(password, serializedKeystore)
                .then(function (encryptedString) {
                  factory.setKeystore(encryptedString);
                  factory.addresses = factory.getLightWalletAddresses();
                  ctrlCallback(factory.addresses);
                });
              });
            }
          }
        });

        //
        /*var deserializedKeystore = lightwallet.keystore.deserialize(factory.getKeystore());
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

        });*/
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
      factory.getLightWalletAddresses = function () {
        accounts = factory.keystore.wallets.map(function(wallet) {
          if (!wallet.getAddressString().startsWith('0x')) {
            return '0x' + wallet.getAddressString();
          }
          return wallet.getAddressString();
        });

        return accounts;
      };



      return factory;
    });
  }
)();
