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
          factory.web3 = LightWallet.web3;
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

      return factory;
    });
  }
)();
