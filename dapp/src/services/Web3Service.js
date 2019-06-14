(
  function () {
    angular
      .module('multiSigWeb')
      .service("Web3Service", function ($window, Utils, $uibModal, Connection, Config, $http) {

        var factory = {
          coinbase: null,
          accounts: []
        };

        factory.webInitialized = function () {
          return new Promise(function (resolve, reject) {
            factory.reloadWeb3Provider(resolve, reject);
          });
        }

        /**
        * Asks Metamask to open its widget.
        * Returns a callback call with the list of accounts or null in case the
        * user rejects the approval request.
        * @param callback, function (error, accounts)
        */
        factory.enableMetamask = function (callback) {
          $window.ethereum.enable().then(function (accounts) {
            factory.reloadWeb3Provider(null, callback);
            // Convert to checksummed addresses
            accounts = factory.toChecksumAddress(accounts);
            // Set accounts and coinbase
            factory.accounts = accounts;
            factory.coinbase = accounts[0];
            callback(null, accounts)
          }).catch(function (error) {
            callback(error, null)
          });
        };

        /**
        * Returns true if metamask is injected, false otherwise
        **/
        factory.isMetamaskInjected = function () {
          return window && (typeof window.web3 !== 'undefined' &&
            (window.web3.currentProvider.constructor.name === 'MetamaskInpageProvider' || window.web3.currentProvider.isMetaMask !== 'undefined')
          );
        };

        /**
        * Reloads web3 provider
        * @param resolve, function (optional)
        * @param reject, function (optional)
        **/
        factory.reloadWeb3Provider = function (resolve, reject) {

          factory.accounts = [];
          factory.coinbase = null;
          var web3 = null;

          // Legacy dapp browsers...
          if ($window.web3 && !$window.ethereum) {
            web3 = $window.web3;
          }
          // https://github.com/MetaMask/metamask-extension/blob/2f7d4494278ad809c1cc9fcc0d9438182003b22d/app/scripts/inpage.js#L101
          else if ($window.ethereum) {
            web3 = $window.ethereum;
          }

          if (!web3) {
            reject('Web3 Provider not connected');
            return;
          }

          // Ledger wallet
          if (txDefault.wallet == "ledger") {
            if (isElectron) {
              factory.ledgerElectronSetup().then(function () {
                if (resolve) {
                  resolve()
                }
              }, function (e) {
                if (reject) {
                  reject(e)
                }
              })
            }
            else {
              factory.ledgerSetup().then(function () {
                if (resolve) {
                  resolve()
                }
              }, function (e) {
                if (reject) {
                  reject(e)
                }
              })
            }
          }
          else if (txDefault.wallet == "trezor") {
            factory.trezorSetup();
            if (resolve) {
              resolve();
            }
          }
          // injected web3 provider (Metamask, mist, etc)
          else if (txDefault.wallet == "injected" && web3 && !isElectron) {
            factory.web3 = web3.currentProvider !== undefined ? new MultisigWeb3(web3.currentProvider) : new MultisigWeb3(web3);
            // Set accounts
            // Convert to checksummed addresses
            factory.web3.eth.getAccounts(function (e, accounts) {
              if (e) {
                throw e;
              } else {
                factory.accounts = factory.toChecksumAddress(accounts);
                factory.coinbase = factory.accounts[0];
              }
              if (resolve) {
                resolve();
              }

            });
          }
          else if (txDefault.wallet == 'lightwallet' && isElectron) {
            factory.lightWalletSetup();
            if (resolve) {
              resolve();
            }
          }
          else if (txDefault.wallet == 'remotenode') {
            // Connect to Ethereum Node
            // factory.web3 = new MultisigWeb3(new RpcSubprovider({
            //   rpcUrl: txDefault.ethereumNode
            // }));
            factory.web3 = new MultisigWeb3(new MultisigWeb3.providers.HttpProvider(txDefault.ethereumNode));
            // Check connection
            factory.web3.net.getListening(function (e) {
              if (e) {
                Utils.dangerAlert("You are not connected to any node.");
                if (reject) {
                  reject();
                }
              }
              else {
                // Get accounts from remote node
                factory.web3.eth.getAccounts(function (e, accounts) {
                  if (e) {
                    if (reject) {
                      reject(e);
                    }
                  }
                  else {
                    // Set accounts
                    // Convert to checksummed addresses
                    accounts = factory.toChecksumAddress(accounts);
                    factory.accounts = accounts;
                    factory.coinbase = accounts[0];

                    if (resolve) {
                      resolve();
                    }
                  }
                });
              }
            });
          }
          else if (resolve) {
            resolve();
          }
        };

        /**
         * Converts an object to a checksummed address when possible.
         * Accepts objects, strings and arrays.
         */
        factory.toChecksumAddress = function (item) {
          var checkSummedItem;
          if (item instanceof Array) {
            checkSummedItem = [];
            for (var x = 0; x < item.length; x++) {
              checkSummedItem.push(factory.web3.toChecksumAddress(item[x]))
            }
          } else if (typeof item == "string") {
            checkSummedItem = factory.web3.toChecksumAddress(item)
          } else if (typeof item == "object") {
            checkSummedItem = {};
            var checkSummedKey;
            for (key in item) {
              checkSummedKey = key.startsWith('0x') ? factory.web3.toChecksumAddress(key) : key;
              checkSummedItem[checkSummedKey] = (typeof item[key] == "string" && item[key].startsWith('0x')) ? factory.web3.toChecksumAddress(item[key]) : item[key];

              if (checkSummedItem[checkSummedKey] && checkSummedItem[checkSummedKey].address) {
                checkSummedItem[checkSummedKey].address = factory.web3.toChecksumAddress(checkSummedItem[checkSummedKey].address);
              }

              // specific to Transaction object
              if (checkSummedItem[checkSummedKey] && checkSummedItem[checkSummedKey].info) {
                // Convert info object to checksummed
                checkSummedItem[checkSummedKey].info = factory.toChecksumAddress(checkSummedItem[checkSummedKey].info);
              }
              if (checkSummedItem[checkSummedKey] && checkSummedKey == "info") {
                // Convert info object to checksummed
                checkSummedItem[checkSummedKey] = factory.toChecksumAddress(checkSummedItem[checkSummedKey]);
              }
            }
          } else {
            return item;
          }

          return checkSummedItem
        }

        /**
        * Configure gas limit and gas price
        * Used for ledger wallet, lightwallet and ethereum node providers
        **/
        factory.configureGas = function (params, cb) {
          $uibModal
            .open(
              {
                animation: false,
                templateUrl: 'partials/modals/configureGas.html',
                size: 'md',
                resolve: {
                  options: function () {
                    return params;
                  }
                },
                controller: function ($scope, $uibModalInstance, Wallet, options) {
                  $scope.send = function () {
                    $uibModalInstance.close(
                      {
                        gas: $scope.gasLimit,
                        gasPrice: Math.ceil($scope.gasPrice * 1e9)
                      }
                    );
                  };

                  $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                  }

                  $scope.calculateFee = function () {
                    $scope.txFee = $scope.gasLimit * ($scope.gasPrice * 1e9) / 1e18;
                  }

                  $scope.close = $uibModalInstance.dismiss;

                  Wallet.getGasPrice().then(function (gasPrice) {
                    $scope.gasLimit = options.gas;
                    $scope.minimumGasLimit = options.gas;
                    $scope.gasPrice = gasPrice / 1e9;
                    $scope.calculateFee();
                  }).catch(function (error) {
                    cb(error);
                  });

                }
              }
            )
            .result
            .then(cb);
        };

        factory.sendTransaction = function (method, params, options, cb) {
          var gasConfigurationData;

          if (options && options.onlySimulate === true) {
            gasConfigurationData = options;
          } else {
            gasConfigurationData = params[params.length - 1];
          }


          factory.configureGas(gasConfigurationData, function (gasOptions) {
            var refinedTxOptions = Object.assign({}, params[params.length - 1], gasOptions);
            // Ugly but needed
            params[params.length - 1] = refinedTxOptions
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

            var args;
            if (options && options.onlySimulate) {
              args = params.concat(cb);
              method.call.apply(method.call, args);
            }
            else {
              args = params.concat(sendIfSuccess);
              method.call.apply(method.call, args);
            }
          });
        };

        // /**
        // * Get ethereum accounts and update account list.
        // */
        // factory.updateAccounts = function (cb) {
        //   if (!isElectron && factory.coinbase) {
        //     return factory.web3.eth.getAccounts(
        //       function (e, accounts) {
        //         if (e) {
        //           cb(e);
        //         }
        //         else {
        //           factory.accounts = accounts;
        //
        //           if (factory.coinbase && accounts && accounts.length && accounts.indexOf(factory.coinbase) != -1) {
        //             // same coinbase
        //           }
        //           else if (accounts) {
        //               factory.coinbase = accounts[0];
        //           }
        //           else {
        //             factory.coinbase = null;
        //           }
        //
        //           cb(null, accounts);
        //         }
        //       }
        //     );
        //   }
        //   else {
        //     cb(null, null);
        //   }
        // };

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
                // Convert to Checksummed addresses
                accounts = factory.toChecksumAddress(accounts);
                factory.accounts = accounts.length ? accounts : [];

                if (factory.coinbase && factory.accounts.indexOf(factory.coinbase) != -1) {
                  // same coinbase
                }
                else if (factory.accounts) {
                  factory.coinbase = factory.accounts[0];
                }
                else {
                  factory.coinbase = null;
                }

                cb(null, factory.accounts);
              }
            }
          );
        };

        // Open Info Modal
        function openLedgerModal(isElectron) {
          return new Promise(function (resolve, reject) {
            $uibModal.open({
              templateUrl: 'partials/modals/ledgerHelp.html',
              size: 'md',
              backdrop: 'static',
              windowClass: 'bootstrap-dialog type-info',
              controller: function ($scope, $uibModalInstance) {
                $scope.isElectron = isElectron;
                $scope.isConnected = false;

                $scope.close = function () {
                  $uibModalInstance.close();
                  resolve();
                };

                // $scope.checkCoinbase = function () {
                //   if (Web3Service.coinbase) {
                //     setTimeout($uibModalInstance.close, 1000);
                //     resolve();
                //   }
                //   else {
                //     setTimeout($scope.checkCoinbase, 1000);
                //   }
                // };

                // $scope.checkCoinbase();

                $scope.connect = function () {
                  $scope.showSpinner = true;

                  factory.web3.eth.getAccounts(function (e, accounts) {
                    $scope.showSpinner = false;
                    if (e || accounts == 500) {
                      // reject(e);
                      // TODO Show error message

                    } else {
                      // Convert to Checksummed addresses
                      accounts = factory.toChecksumAddress(accounts);
                      factory.accounts = accounts;
                      factory.coinbase = factory.accounts[0];
                      // Set isConnected to true and show "success" message
                      $scope.isConnected = true;
                      resolve();
                      // $uibModalInstance.close();
                    }
                  });
                }
              }
            });
          });
        }

        /* Ledger setup on browser*/
        factory.ledgerSetup = function () {
          return ledgerwallet(
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
            function (ledgerWeb3) {
              factory.web3 = ledgerWeb3;
              return openLedgerModal(false);
            }
          );
        };

        /* Ledger wallet electron setup */
        factory.ledgerElectronSetup = function () {
          factory.engine = new ProviderEngine();
          factory.web3 = new MultisigWeb3(factory.engine);

          var web3Provider = new HookedWalletSubprovider({
            getAccounts: function (cb) {
              $http.get("http://localhost:" + ledgerPort + "/accounts").success(function (accounts) {
                // Convert to Checksummed addresses
                accounts = factory.toChecksumAddress(accounts);
                cb(null, accounts);
              }).error(cb);
            },
            approveTransaction: function (txParams, cb) {
              Utils.showSpinner();
              cb(null, true);
            },
            signTransaction: function (txData, cb) {
              function sendToLedger(chainID) {
                $http.post("http://localhost:" + ledgerPort + "/sign-transaction", { tx: txData, chain: chainID }).then(function (tx) {
                  Utils.stopSpinner();
                  cb(null, tx.data.signed);
                }, function (e) {
                  Utils.stopSpinner(); cb(e);
                });
              }

              if (!Connection.isConnected) {
                if (txDefault.defaultChainID) {
                  sendToLedger(txDefault.defaultChainID);
                }
                else {
                  Utils.stopSpinner();
                  cb("You must set an offline Chain ID in order to sign offline transactions");
                }
              }
              else {
                if (factory.web3) {
                  factory.web3.version.getNetwork(function (e, chainID) {
                    if (e) {
                      Utils.stopSpinner();
                      cb(e);
                    }
                    else {
                      sendToLedger(chainID);
                    }
                  });
                }
                else {
                  Utils.stopSpinner();
                  cb("No valid web3 object");
                }
              }
            }
          });

          factory.web3 = new MultisigWeb3(factory.engine);

          factory.engine.addProvider(web3Provider);

          factory.engine.addProvider(new RpcSubprovider({
            rpcUrl: txDefault.ethereumNode
          }));

          factory.engine.start();

          return openLedgerModal(true);
        };

        /* Trezor setup */
        factory.trezorSetup = function () {
          factory.engine = new ProviderEngine();
          factory.web3 = new MultisigWeb3(factory.engine);

          var web3Provider = new HookedWalletSubprovider({
            getAccounts: function (cb) {
              if (!factory.accounts.length) {
                TrezorConnect.ethereumGetAddress("m/44'/60'/0'/0/0", function (response) {
                  if (response.success) {
                    // Convert to Checksummed address
                    factory.accounts = factory.toChecksumAddress(["0x" + response.address]);
                    cb(null, factory.accounts)
                  }
                  else {
                    cb(response.error)
                  }
                })
              }
              else {
                cb(null, factory.accounts)
              }
            },
            approveTransaction: function (txParams, cb) {
              cb(null, true);
            },
            signTransaction: function (txData, cb) {
              factory.web3.version.getNetwork(function (e, chainID) {
                if (!txData.value) {
                  txData.value = '0x00'
                }
                TrezorConnect.ethereumSignTx(
                  "m/44'/60'/0'/0/0", // address path - either array or string, see example
                  Utils.trezorHex(txData.nonce),     // nonce - hexadecimal string
                  Utils.trezorHex(txData.gasPrice), // gas price - hexadecimal string
                  Utils.trezorHex(txData.gas), // gas limit - hexadecimal string
                  txData.to ? Utils.trezorHex(txData.to) : null,        // address
                  Utils.trezorHex(txData.value),     // value in wei, hexadecimal string
                  txData.data ? Utils.trezorHex(txData.data) : null,      // data, hexadecimal string OR null for no data
                  parseInt(chainID, 16),  // chain id for EIP-155 - is only used in fw 1.4.2 and newer, older will ignore it
                  function (response) {
                    if (response.success) {
                      txData.value = txData.value || '0x00';
                      txData.data = ethereumjs.Util.addHexPrefix(txData.data);
                      txData.gasPrice = parseInt(txData.gasPrice, 16);
                      txData.nonce = parseInt(txData.nonce, 16);
                      txData.gasLimit = txData.gas;
                      txData.v = response.v;
                      txData.s = '0x' + response.s;
                      txData.r = '0x' + response.r;
                      // Sign transaction
                      var tx = new ethereumjs.Tx(txData);
                      cb(null, '0x' + tx.serialize().toString('hex'));
                    }
                    else {
                      cb(response.error)
                    }
                  })
              });
            }
          });

          factory.web3 = new MultisigWeb3(factory.engine);

          factory.engine.addProvider(web3Provider);

          factory.engine.addProvider(new RpcSubprovider({
            rpcUrl: txDefault.ethereumNode
          }));
          factory.engine.start();
        };

        /**
        * Select account
        * @param account {String} - Checksumed address
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
        * Sets Web3 up for the lightwallet
        */
        function _lightwalletWeb3Setup() {
          // Set HookedWeb3Provider
          const ethUtil = require('ethereumjs-util');
          const EthTx = require('ethereumjs-tx');
          var web3Provider = null;
          var options = {
            getAccounts: function (cb) {
              cb(null, factory.getLightWalletAddresses());
            },
            approveTransaction: function (txParams, cb) {
              cb(null, true);
            },
            signTransaction: function (txData, cb) {
              // Show password modal
              $uibModal.open({
                templateUrl: 'partials/modals/askLightWalletPassword.html',
                size: 'md',
                backdrop: 'static',
                controller: function ($scope, $uibModalInstance) {
                  $scope.title = 'Confirm transaction';
                  $scope.hasError = false;
                  $scope.errorMessage = '';

                  $scope.ok = function () {
                    // Enable spinner
                    $scope.showLoadingSpinner = true;

                    factory.decryptLightWallet(txData.from, $scope.password, function (response, v3Instance) {
                      if (!response) {
                        // Disable spinner
                        $scope.showLoadingSpinner = false;
                        //$uibModalInstance.dismiss();
                        $scope.hasError = true;
                        //cb('Invalid password', null);
                        /*cb_copy = cb.bind({})
                        cb_copy('Invalid password', null);*/
                      }
                      else {
                        // Retrieve wallet private key
                        var privateKey = v3Instance.getPrivateKey();
                        txData.value = txData.value || '0x00';
                        txData.data = ethUtil.addHexPrefix(txData.data);
                        txData.gasPrice = parseInt(txData.gasPrice, 16);
                        txData.nonce = parseInt(txData.nonce, 16);
                        txData.gasLimit = txData.gas;

                        // Sign transaction
                        var tx = new EthTx(txData);
                        tx.sign(privateKey);
                        // Disable spinner
                        $scope.showLoadingSpinner = false;
                        cb(null, '0x' + tx.serialize().toString('hex'));
                        $uibModalInstance.close();
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
                  };

                }
              });
            }
          };

          web3Provider = new HookedWalletSubprovider(options);
          //web3Provider.transaction_signer = factory.keystore;
          web3Provider.host = txDefault.ethereumNode;
          // Setup engine
          factory.engine = new ProviderEngine();
          factory.web3 = new MultisigWeb3(factory.engine);
          // Add providers
          factory.engine.addProvider(web3Provider);
          factory.engine.addProvider(new RpcSubprovider({
            rpcUrl: txDefault.ethereumNode
          }));
          // Start engine
          factory.engine.start();
        }

        /**
        * Light wallet setup
        * @param restore, default false
        * @param password, default null
        */
        factory.lightWalletSetup = function (restore = false, password = null) {
          factory.password_provider_callback = null;
          /*factory.engine = new ProviderEngine();
          factory.web3 = new Web3(factory.engine);*/

          if (factory.getKeystore()) {
            if (restore) {
              factory.restoreLightWallet(password);
            }
            else {
              _lightwalletWeb3Setup();
            }
          }
        };

        /**
        * Creates a new keystore and within one account
        */
        factory.createLightWallet = function (password, ctrlCallback) {
          var v3String = null;
          // key => value object (address => V3)
          var keystoreObj = JSON.parse(factory.getKeystore()) || {};
          var seed = factory.generateLightWalletSeed();
          // Create hd keystore
          var keyring = new hdkeyring({
            mnemonic: seed,
            numberOfAccounts: 1,
          });

          v3String = keyring.wallets[0].toV3String(password);

          // Set keystore in V3 format
          factory.keystore = keyring.wallets[0].toV3(password);
          // Encrypt V3
          encryptor.encrypt(password, v3String)
            .then(function (encryptedV3String) {
              var _generatedAddress = keyring.wallets[0].getAddressString();
              // Convert address to checksummed address
              var generatedAddress = factory.toChecksumAddress(_generatedAddress);

              if (!generatedAddress.startsWith('0x')) {
                generatedAddress = '0x' + generatedAddress;
              }

              // Add address => encrypted V3 to keystore object
              keystoreObj[generatedAddress] = encryptedV3String;
              // Save the global keystore object
              factory.setKeystore(keystoreObj);
              // Add the new address to the list of available addresses
              factory.addresses.push(generatedAddress);
              // Set the new account as selected
              factory.selectAccount(generatedAddress);
              // Do web3 setup
              factory.lightWalletSetup(false);

              ctrlCallback(generatedAddress);
            });
        };

        factory.importLightWalletAccount = function (v3, password, ctrlCallback) {
          // DIRTY but MyEtherWallet doesn't generate an standard V3 file, it adds a word Crypto instead of crypto
          if (v3.Crypto && !v3.crypto) {
            v3.crypto = v3.Crypto;
            delete v3.Crypto;
          }
          var v3String = JSON.stringify(v3);
          // Verify passphrase is correct
          try {
            v3Instance = ethereumWallet.fromV3(v3String, password);
          } catch (error) {
            ctrlCallback(error);
            return;
          }


          // key => value object (address => V3)
          var keystoreObj = JSON.parse(factory.getKeystore()) || {};

          // Set keystore in V3 format
          factory.keystore = v3;

          // Encrypt V3
          encryptor.encrypt(password, v3String)
            .then(function (encryptedV3String) {
              var generatedAddress = factory.toChecksumAddress(v3.address);

              if (!generatedAddress.startsWith('0x')) {
                generatedAddress = '0x' + generatedAddress;
              }

              // Add address => encrypted V3 to keystore object
              keystoreObj[generatedAddress] = encryptedV3String;
              // Save the global keystore object
              factory.setKeystore(keystoreObj);
              // Add the new address to the list of available addresses
              factory.addresses.push(generatedAddress);
              // Set the new account as selected
              factory.selectAccount(generatedAddress);
              // Do web3 setup
              factory.lightWalletSetup(false);

              ctrlCallback(null, generatedAddress);
            });
        };

        /**
        * Decrypts a V3 keystore
        */
        factory.decryptLightWallet = function (address, password, callback) {
          var keystore = JSON.parse(factory.getKeystore());
          var encryptedV3String = keystore[address];
          encryptor.decrypt(password, encryptedV3String)
            .then(function (decryptedV3String) {
              v3Instance = ethereumWallet.fromV3(decryptedV3String, password);
              callback(true, v3Instance);
            })
            .catch(function (error) {
              callback(false);
            });
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
                .then(function (decryptedV3String) {
                  factory.keystore = JSON.parse(decryptedV3String); //ethereumWallet.fromV3(decryptedV3String, password);
                  factory.addresses = factory.getLightWalletAddresses();
                  _lightwalletWeb3Setup();
                });
            }
            catch (error) {
              Utils.dangerAlert({ message: "Invalid password." });
            }
          }
          else if (factory.getKeystore()) {
            var _address;
            Config.getConfiguration('accounts').map(function (account) {
              address = '0x' + account.address.replace('0x', '');
              addr.push(factory.toChecksumAddress(_address));
            });
          }
        };

        /**
        * Returns keystore string from localStorage or null
        */
        factory.getKeystore = function () {
          return localStorage.getItem('keystore');
        };

        /**
        * Set keystore localStorage string
        */
        factory.setKeystore = function (value) {
          // check wheter valus is a JSON valid format
          var valueToStore;
          try {
            valueToStore = JSON.stringify(value);
            localStorage.setItem('keystore', valueToStore);
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

        /**
        * Generates a new random seed
        */
        factory.generateLightWalletSeed = function () {
          return lightwallet.keystore.generateRandomSeed();
        };

        /**
        * Return accounts list
        */
        factory.getLightWalletAddresses = function () {
          var addresses = [];
          Config.getConfiguration('accounts').map(function (item) {
            addresses.push(item.address);
          });

          return addresses;
        };


        /**
        /* Engine setup on startup
        */
        function _startupSetup() {
          factory.engine = new ProviderEngine();
          factory.web3 = new MultisigWeb3(factory.engine);
          if (factory.getKeystore()) {
            factory.engine.addProvider(new RpcSubprovider({
              rpcUrl: txDefault.ethereumNode
            }));
          }
          factory.engine.start();
        }
        _startupSetup();

        return factory;
      });
  }
)();
