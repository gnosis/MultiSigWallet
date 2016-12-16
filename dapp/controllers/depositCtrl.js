(
  function(){
    angular
    .module("multiSigWeb")
    .controller("depositCtrl", function($scope, Transaction, $routeParams, $uibModalInstance, Wallet, Utils, wallet){
      $scope.wallet = wallet;
      $scope.amount = 10;
      $scope.deposit = function(){
        Transaction.send(
          {
            to: $scope.wallet.address,
            value: new EthJS.BN(new Web3().toWei($scope.amount)),
            nonce: Wallet.txParams.nonce
          },
          function(e, tx){
            if(tx.blockNumber){
              Utils.success("Ether is now on your wallet");
            }
            else{
              Utils.notification("Transaction sent, will be mined in next 20s");
              $uibModalInstance.close();
            }
          }
        )
      }

      $scope.sign = function(){
        Transaction.signOffline(
          {
            to: $scope.wallet.address,
            value: new EthJS.BN(new Web3().toWei($scope.amount)),
            nonce: Wallet.txParams.nonce
          },
          function(e, tx){
            if(e){
              Utils.dangerAlert(e);
            }
            else{
              $uibModalInstance.close();
              Utils.signed(tx);
            }
          });
        }

        $scope.cancel = function(){
          $uibModalInstance.dismiss();
        }
    });
  }
)();
