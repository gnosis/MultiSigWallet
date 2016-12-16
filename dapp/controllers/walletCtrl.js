(
  function(){
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function($scope, Wallet, Utils, Transaction,
      Owner, $uibModal, $interval){

      $scope.updateParams = function(){
        $scope.wallets = Wallet.wallets;
        $scope.totalItems = Object.keys($scope.wallets).length;
        var batch = Wallet.web3.createBatch();
        // Init wallet balance of each wallet address
        Object.keys($scope.wallets).map(function(address){
          batch.add(
            Wallet.getBalance(
              address,
              function(e, balance){
                $scope.wallets[address].balance = balance.div('1e18').toNumber();
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
      $scope.new = {
        name: 'MultiSig Wallet',
        owners: {},
        confirmations : 1
      };

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

    });
  }
)();
