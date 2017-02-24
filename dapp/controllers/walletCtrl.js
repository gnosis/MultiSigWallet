(
  function () {
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function ($rootScope, $scope, Wallet, Utils, Token, Transaction, $uibModal, $interval) {
      Wallet
      .webInitialized
      .then(
        function () {
            $scope.batch = Wallet.web3.createBatch();
            $scope.interval = $interval($scope.updateParams, 10000);
            $scope.wallets = Wallet.wallets;
            if ( Wallet.coinbase && (!$scope.wallets || !Object.keys($scope.wallets).length && !$rootScope.alreadyLogged)){
              $scope.termsInterval = $interval($scope.checkTerms, 500);
            }
            $scope.updateParams();
            $rootScope.alreadyLogged = true;
        }
      );

      $scope.checkTerms = function () {
        if (localStorage.getItem("termsAccepted")){
          $interval.cancel($scope.termsInterval);
          $scope.newWalletSelect();
        };
      };

      $scope.wallets = {};

      $scope.$watch(
        function () {
          return Wallet.updates;
        },
        function () {
          var walletsToCopy = Wallet.getAllWallets();

          for (wallet in walletsToCopy) {
            if (!$scope.wallets[wallet]) {
              $scope.wallets[wallet] = {};
            }
            Object.assign($scope.wallets[wallet], walletsToCopy[wallet]);
          }

          // Remove removed wallets
          for (wallet in $scope.wallets) {
            if (!walletsToCopy[wallet]) {
              delete $scope.wallets[wallet];
            }
          }
          $scope.totalItems = Object.keys($scope.wallets).length;
        }
      );

      $scope.updateParams = function () {
        if ($scope.wallets) {
          // Init wallet balance of each wallet address
          Object.keys($scope.wallets).map(function (address) {
            $scope.batch.add(
              Wallet.getBalance(
                address,
                function (e, balance) {
                  if(!e && balance && $scope.wallets[address]){
                    $scope.$apply(function () {
                      $scope.wallets[address].balance = balance;
                    });
                  }
                }
              )
            );

            $scope.batch.add(
              Wallet.getRequired(
                address,
                function (e, confirmations) {
                  if($scope.wallets[address] && confirmations && confirmations.greaterThan(0)){
                    $scope.$apply(function () {
                      $scope.wallets[address].confirmations = confirmations;
                    });
                  }
                }
              )
            );

            $scope.batch.add(
              Wallet.getLimit(
                address,
                function (e, limit) {
                  if(!e && limit && $scope.wallets[address]){
                    $scope.$apply(function () {
                      $scope.wallets[address].limit = limit;
                    });
                  }
                }
              )
            );

            $scope.batch.add(
              Wallet.calcMaxWithdraw(
                address,
                function (e, max) {
                  if(!e && max && $scope.wallets[address]){
                    $scope.$apply(function () {
                      $scope.wallets[address].maxWithdraw = max;
                    });
                  }
                }
              )
            );
          });
          $scope.batch.execute();
        }
        else {
          $scope.totalItems = 0;
        }
      };



      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
        $interval.cancel($scope.termsInterval);
      });

      /*$scope.currentPage = 1;
      $scope.itemsPerPage = 5;*/


      $scope.newWalletSelect = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/selectNewWallet.html',
          size: 'sm',
          controller: function ($scope, $uibModalInstance) {
            $scope.walletOption = "create";

            $scope.ok = function () {
              $uibModalInstance.close($scope.walletOption);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function (option) {
            if (option == "create") {
              // open create modal
              $scope.newWallet();
            }
            else {
              // open recover modal
              $scope.restoreWallet();
            }
          }
        );
      };

      $scope.newWallet = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/newWallet.html',
          size: 'lg',
          controller: 'newWalletCtrl',
          resolve: {
            callback: function () {
              return function () {
                $scope.updateParams();
              };
            }
          }
        });
      };


      $scope.removeWallet = function (address) {
        $uibModal.open({
          templateUrl: 'partials/modals/removeWallet.html',
          size: 'md',
          scope: $scope,
          controller: 'removeWalletCtrl',
          resolve: {
            wallet: function () {
              return $scope.wallets[address];
            },
            callback: function () {
              return $scope.updateParams;
            }
          }
        });
      };

      $scope.restoreWallet = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/restoreWallet.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance) {
            $scope.ok = function () {
              Wallet.restore($scope.old, function (e) {
                if (e) {
                  Utils.dangerAlert(e);
                }
                else {
                  $uibModalInstance.close();
                }
              });
            };
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      $scope.editWallet = function (wallet) {
        $uibModal.open({
          templateUrl: 'partials/modals/editWallet.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return wallet;
            }
          },
          controller: function ($scope, $uibModalInstance, wallet) {
            $scope.name = wallet.name;
            $scope.address = wallet.address;

            $scope.ok = function () {
              Wallet.update(wallet.address, $scope.name);
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      $scope.deposit = function (wallet) {
        $uibModal.open({
          templateUrl: 'partials/modals/deposit.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return wallet;
            }
          },
          controller: 'depositCtrl'
        });
      };

      $scope.setRequired = function (wallet) {
        $uibModal.open({
          templateUrl: 'partials/modals/updateRequired.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return wallet;
            }
          },
          controller: 'updateRequiredCtrl'
        });
      };

      $scope.setLimit = function (wallet) {
        $uibModal.open({
          templateUrl: 'partials/modals/setLimit.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return wallet;
            }
          },
          controller: 'setLimitCtrl'
        });
      };

      $scope.withdrawLimit = function (wallet) {
        $uibModal.open({
          templateUrl: 'partials/modals/withdrawLimit.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return wallet;
            }
          },
          controller: 'withdrawLimitCtrl'
        });
      };
    });
  }
)();
