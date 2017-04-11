(
  function () {
    angular
    .module("multiSigWeb")
    .service("LightWallet", function ($http, $window) {

      var factory = {};

      factory.password_provider_callback = null;
      factory.engine = new ProviderEngine();
      factory.web3 = new Web3(factory.engine);
      factory.addresses = [];

      factory.create = function (password, seed, ctrlCallback) {

        /*lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
          factory.keystore = new lightwallet.createVault(seed, pwDerivedKey);
          factory.keystore.generateNewAddress(pwDerivedKey, 1);
          factory.coinbase = "0x" + factory.keystore.getAddresses()[0];
          localStorage.setItem('keystore', factory.keystore.serialize());
          factory.keystore.passwordProvider = factory.password_provider_callback;
          factory.connectProvider();
        });*/

        var opts = {
          password: password,
          seedPhrase: seed,
          hdPathString: "m/44'/60'/0'/0"
        };

        lightwallet.keystore.createVault(opts, function(err, ks) {
          if (err) throw err;

          var config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));

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

            // Set HookedWeb3Provider
            factory.web3.setProvider(new HookedWeb3Provider({
              getAccounts: function (cb) {
                    cb(null, addresses)
              },
              approveTransaction: function(txParams, cb) {
                cb(null, true);
              },
              signTransaction: function(txData, cb) {
                /*txData.gasPrice = parseInt(txData.gasPrice, 16);
                txData.nonce = parseInt(txData.nonce, 16);
                txData.gasLimit = txData.gas;
                var tx = lightwallet.txutils.createContractTx(addresses, txData);
                var signed = lightwallet.signing.signTx(ks, pwDerivedKey, tx.tx, addresses);
                cb(null, signed);*/
              },
              transaction_signer: ks,
              host: config.ethereumNode
            }));

            ctrlCallback();

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

      factory.restore = function () {
        var keystore = this.getKeystore();
        var deserializedKeystore = lightwallet.keystore.deserialize(keystore);
        factory.addresses = deserializedKeystore.getAddresses();
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
