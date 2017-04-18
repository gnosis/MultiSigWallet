(
  function () {
    angular
    .module("multiSigWeb")
    .service("LightWallet", function ($http, $window, Config, $uibModal, Utils) {

      var factory = {};

      factory.keystore = null;
      factory.addresses = [];
      //$window.test = factory.web3;

      factory.setup = function () {
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
                        //TODO get current account from Wallet
                        var sendingAddress = factory.getAddresses()[0];
                        var contractData = lightwallet.txutils.createContractTx(sendingAddress, txData);
                        var signedTx = lightwallet.signing.signTx(factory.keystore, pwDerivedKey, contractData.tx, sendingAddress, "m/44'/60'/0'/0");
                        cb(null, signedTx);
                        $uibModalInstance.close();
                      }
                      else {
                        $uibModalInstance.dismiss();
                        cb('Invalid password', null);
                        //Utils.dangerAlert({'message': 'Invalid password'});
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
            /*transaction_signer: factory.keystore,
            host: txDefault.ethereumNode*/
          });

          web3Provider.transaction_signer = factory.keystore;
          web3Provider.host = txDefault.ethereumNode;

          //factory.web3.setProvider(web3Provider);
          factory.engine.addProvider(web3Provider);

          factory.engine.addProvider(new RpcSubprovider({
            rpcUrl: txDefault.ethereumNode
          }));

          factory.engine.start();
        }
      };

      factory.create = function (password, seed, ctrlCallback) {

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

            factory.setup();

            // Set HookedWeb3Provider
            /*factory.web3.setProvider(new HookedWeb3Provider({
              getAccounts: function (cb) {
                    cb(null, ks.getAddresses())
              },
              approveTransaction: function(txParams, cb) {
                cb(null, true);
              },
              signTransaction: function(txData, cb) {
                txData.gasPrice = parseInt(txData.gasPrice, 16);
                txData.nonce = parseInt(txData.nonce, 16);
                txData.gasLimit = txData.gas;
                var tx = lightwallet.txutils.createContractTx(addresses, txData);
                var signed = lightwallet.signing.signTx(ks, pwDerivedKey, tx.tx, addresses);
                cb(null, signed);
              },
              transaction_signer: ks,
              host: config.ethereumNode
            }));*/

            ctrlCallback(factory.addresses);

          });
        });
      };

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

      factory.restore = function () {
        var keystore = factory.getKeystore();
        factory.keystore = lightwallet.keystore.deserialize(keystore);
        /*var addresses = factory.keystore.getAddresses();

        if (addresses) {
          for (var x in addresses) {
            if (!addresses[x].startsWith('0x')) {
              addresses[x] = '0x' + addresses[x];
            }
          }
        }*/

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
            deserializedKeystore.generateNewAddress(pwDerivedKey, 1);
            // Add new address to addresses list
            factory.addresses.push(deserializedKeystore.getAddresses().slice(-1)[0]);

            factory.setKeystore(deserializedKeystore.serialize());
            ctrlCallback(factory.addresses.slice(-1)[0]);
          }
          else {
            ctrlCallback();
          }

        });
      };

      factory.getKeystore = function () {
        return localStorage.getItem('keystore');
      };

      factory.setKeystore = function (value) {
        return localStorage.setItem('keystore', value);
      };

      factory.isSeedValid = function (seed) {
        return lightwallet.keystore.isSeedValid(seed);
      };

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
