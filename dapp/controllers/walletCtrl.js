(
  function(){
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function($scope, Wallet, Utils, Transaction,
      $uibModal, $interval){

      var batch = Wallet.web3.createBatch();

      $scope.updateParams = function(){
        $scope.wallets = Wallet.wallets;
        $scope.totalItems = Object.keys($scope.wallets).length;
        // Init wallet balance of each wallet address
        Object.keys($scope.wallets).map(function(address){
          batch.add(
            Wallet.getBalance(
              address,
              function(e, balance){
                $scope.wallets[address].balance = balance;
                $scope.$apply();
              }
            )
          );

          batch.add(
            Wallet.getRequired(
              address,
              function(e, confirmations){
                $scope.wallets[address].confirmations = confirmations;
                $scope.$apply();
              }
            )
          );

          batch.add(
            Wallet.getLimit(
              address,
              function(e, limit){
                $scope.wallets[address].limit = limit;
                $scope.$apply();
              }
            )
          );
        });
        batch.execute();
      }
      $scope.updateParams();
      $scope.interval = $interval($scope.updateParams, 15000);


      $scope.$on('$destroy', function(){
        $interval.cancel($scope.interval);
      });

      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;


      $scope.newWalletSelect = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/selectNewWallet.html',
          size: 'sm',
          controller: function($scope, $uibModalInstance) {
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
          function(option){
            if(option == "create"){
              // open create modal
              $scope.newWallet();
            }
            else{
              // open recover modal
              $scope.restoreWallet();
            }
          }
        );

      }

      $scope.newWallet = function(){

        $uibModal.open({
          templateUrl: 'partials/modals/newWallet.html',
          size: 'lg',
          controller: 'newWalletCtrl'
        })
        .result
        .then(function(){
          $scope.updateParams();
        });
      }

      $scope.addOwner = function(){
        $scope.new.owners[$scope.owner.address] = {};
        angular.copy($scope.owner, $scope.new.owners[$scope.owner.address]);
      }



      $scope.removeWallet = function(address){
        $uibModal.open({
          templateUrl: 'partials/modals/removeWallet.html',
          size: 'lg',
          resolve: {
            wallet: function(){
              return $scope.wallets[address];
            }
          },
          controller: function($scope, $uibModalInstance, wallet){
            $scope.wallet = wallet;
            $scope.ok = function(){
              Wallet.removeWallet($scope.wallet.address);
              $uibModalInstance.close();
            }

            $scope.cancel = function(){
              $uibModalInstance.dismiss();
            }
          }
        });
      }

      $scope.restoreWallet = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/restoreWallet.html',
          size: 'lg',
          controller: function($scope, $uibModalInstance){
            $scope.ok = function(){
              Wallet.restore($scope.old, function(e, w){
                if(e){
                  Utils.dangerAlert(e);
                }
                else{
                  $uibModalInstance.close();
                }
              });
            }

            $scope.cancel = function(){
              $uibModalInstance.dismiss();
            }
          }
        });
      }

      $scope.editWallet = function(wallet){
        $uibModal.open({
          templateUrl: 'partials/modals/editWallet.html',
          size: 'sm',
          resolve: {
            wallet: function(){
              return wallet;
            }
          },
          controller: function($scope, $uibModalInstance, wallet){
            $scope.name = wallet.name;
            $scope.address = wallet.address;

            $scope.ok = function(){
              Wallet.update(wallet.address, $scope.name);
              $uibModalInstance.close();
            }

            $scope.cancel = function(){
              $uibModalInstance.dismiss();
            }
          }
        });
      }

      $scope.deposit = function(wallet){
        $uibModal.open({
          templateUrl: 'partials/modals/deposit.html',
          size: 'md',
          resolve: {
            wallet: function(){
              return wallet;
            }
          },
          controller: 'depositCtrl'
        });
      }

      $scope.setRequired = function(wallet){
        $uibModal.open({
          templateUrl: 'partials/modals/updateRequired.html',
          size: 'md',
          resolve: {
            wallet: function(){
              return wallet;
            }
          },
          controller: 'updateRequiredCtrl'
        });
      }

      $scope.setLimit = function(wallet){
        $uibModal.open({
          templateUrl: 'partials/modals/setLimit.html',
          size: 'md',
          resolve: {
            wallet: function(){
              return wallet;
            }
          },
          controller: 'setLimitCtrl'
        });
      }

    });
  }
)();
