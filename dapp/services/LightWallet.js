(
  function () {
    angular
    .module("multiSigWeb")
    .service("LightWallet", function ($http, $window, Config) {

      var factory = {};

      factory.keystore = null;
      factory.addresses = [];
      $window.test = factory.web3;

      factory.setup = function () {
        factory.password_provider_callback = null;
        factory.engine = new ProviderEngine();
        factory.web3 = new Web3(factory.engine);

        if (factory.getKeystore()) {
          factory.restore();
          // Set HookedWeb3Provider
          var web3Provider = new HookedWeb3Provider({
            getAccounts: function (cb) {
                  cb(null, factory.keystore.getAddresses())
            },
            approveTransaction: function(txParams, cb) {
              cb(null, true);
            },
            signTransaction: function(txData, cb) {

            },
            transaction_signer: factory.keystore,
            host: txDefault.ethereumNode
          });

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
            var addresses = ks.getAddresses();
            factory.addresses = addresses;
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

        })

        /*lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {

          factory.keystore = new lightwallet.keystore(seed, pwDerivedKey);
          // generate five new address/private key pairs
          // the corresponding private keys are also encrypted
          factory.keystore.generateNewAddress(pwDerivedKey, 1);
          var addresses = factory.keystore.getAddresses();

          factory.setKeystore(factory.keystore.serialize());

          // Create a custom passwordProvider to prompt the user to enter their
          // password whenever the hooked web3 provider issues a sendTransaction
          // call.
          factory.keystore.passwordProvider = function (callback, pwd) {
            callback(null, pwd);
          };

          // Now set ks as transaction_signer in the hooked web3 provider
          // and you can start using web3 using the keys/addresses in ks!
          factory.engine.addProvider(new HookedWalletSubprovider({
            getAccounts: function (cb) {
                  cb(null, addresses)
            },
            approveTransaction: function(txParams, cb) {
              cb(null, true);
            },
            signTransaction: function(txData, cb) {
              txData.gasPrice = parseInt(txData.gasPrice, 16);
              txData.nonce = parseInt(txData.nonce, 16);
              txData.gasLimit = txData.gas;
              var tx = lightwallet.txutils.createContractTx(addr, txData);
              var signed = lightwallet.signing.signTx(ks, pwDerivedKey, tx.tx, addr);
              cb(null, signed);
            }
          }));

        });*/

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

      return factory;
    });
  }
)();
