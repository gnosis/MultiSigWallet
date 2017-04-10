(
  function () {
    angular
    .module('multiSigWeb')
    .service("Web3Service", function ($window, $q, Utils, $uibModal) {
      factory = {};

      factory.webInitialized = $q(function (resolve, reject) {
        window.addEventListener('load', function () {
          // Ledger wallet
          if (txDefault.wallet == "ledger") {
            ledgerwallet(
              {
                rpcUrl: txDefault.ethereumNode,
                onSubmit: function () {
                  Utils.showSpinner();
                },
                onSigned: function () {
                  Utils.stopSpinner();
                }
              }
            ).then(
              function(ledgerWeb3){
                factory.web3 = ledgerWeb3;
                resolve();
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
                      if (wallet.coinbase) {
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
          else if (txDefault.wallet == "injected" && $window && $window.web3) {
            factory.web3 = new Web3($window.web3.currentProvider);
            resolve();
          }
          else {
            factory.web3 = new Web3(new Web3.providers.HttpProvider(txDefault.ethereumNode));
            // Check connection
            factory.web3.net.getListening(function(e){
              if (e) {
                Utils.dangerAlert("You are not connected to any node.");
                reject();
              }
              else{
                resolve();
              }
            });
          }
        });
      });

      factory.sendTransaction = function (method, params, cb) {
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

        var args = params.concat(sendIfSuccess);
        method.call.apply(method.call, args);
      };

      return factory;
    });
  }
)();
