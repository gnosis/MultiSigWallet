(
  function(){
    angular
    .module("multiSigWeb")
    .controller("confirmTransactionCtrl", function($scope, txHash, address, Wallet, Transaction, $uibModalInstance, Utils){
      $scope.send = function(){
        Wallet.confirmTransaction(address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Confirmation sent, will be mined in next 20s");
            Transaction.add({txHash: tx, callback: function(){
              Utils.success("Confirmation mined");
            }});
            $uibModalInstance.close();
          }
        });
      }

      $scope.sign = function(){
        Wallet.confirmTransactionOffline(address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      }

      $scope.cancel = function(){
        $uibModalInstance.dismiss();
      }
    });
  }
)();
