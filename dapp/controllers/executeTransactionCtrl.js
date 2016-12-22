(
  function(){
    angular
    .module("multiSigWeb")
    .controller("executeTransactionCtrl", function($scope, txHash, address, Wallet, Transaction, $uibModalInstance, Utils){
      $scope.send = function(){
        Wallet.executeTransaction(address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Execution sent, will be mined in next 20s");
            Transaction.add({txHash: tx, callback: function(){
              Utils.success("Execution mined");
            }});
            $uibModalInstance.close();
          }
        });
      }

      $scope.sign = function(){
        Wallet.executeTransactionOffline(address, txHash, function(e, tx){
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
