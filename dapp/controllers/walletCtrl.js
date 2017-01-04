(
  function () {
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function ($rootScope, $scope, Wallet, Utils, Transaction, $uibModal, $interval) {
      Wallet
      .webInitialized
      .then(
        function () {
            $scope.batch = Wallet.web3.createBatch();
            $scope.updateParams();
            $scope.interval = $interval($scope.updateParams, 7000);
        }
      );

      $scope.updateParams = function () {
        $rootScope.wallets = Wallet.getAllWallets();
        $scope.totalItems = Object.keys($scope.wallets).length;
        // Init wallet balance of each wallet address
        Object.keys($scope.wallets).map(function (address) {
          $scope.batch.add(
            Wallet.getBalance(
              address,
              function (e, balance) {
                if($scope.wallets[address]){
                  $scope.wallets[address].balance = balance;
                  $scope.$apply();
                }
              }
            )
          );

          $scope.batch.add(
            Wallet.getRequired(
              address,
              function (e, confirmations) {
                if($scope.wallets[address]){
                  $scope.wallets[address].confirmations = confirmations;
                  $scope.$apply();
                }
              }
            )
          );

          $scope.batch.add(
            Wallet.getLimit(
              address,
              function (e, limit) {
                if($scope.wallets[address]){
                  $scope.wallets[address].limit = limit;
                  $scope.$apply();
                }
              }
            )
          );

          $scope.batch.add(
            Wallet.calcMaxWithdraw(
              address,
              function (e, max) {
                if($scope.wallets[address]){
                  $scope.wallets[address].maxWithdraw = max;
                  $scope.$apply();
                }
              }
            )
          );
        });
        $scope.batch.execute();
      };



      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
      });

      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;


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
                $scope.updateParams()
              }
            }
          }
        });
      };


      $scope.removeWallet = function (address) {
        $uibModal.open({
          templateUrl: 'partials/modals/removeWallet.html',
          size: 'lg',
          scope: $scope,
          controller: 'removeWalletCtrl',
          resolve: {
            wallet: function () {
              return $scope.wallets[address];
            }
          }
        });
      };

      $scope.restoreWallet = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/restoreWallet.html',
          size: 'lg',
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
          size: 'sm',
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
