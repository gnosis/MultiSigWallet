(
  function(){
    angular
    .module("multiSigWeb")
    .controller("removeOwnerCtrl", function($scope, Wallet, Utils, Transaction, wallet, owner, $uibModalInstance){
      $scope.owner = owner;
      $scope.send = function () {
        Wallet.removeOwner(wallet.address, $scope.owner, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            // Update owners array
            Wallet.updateWallet(wallet);
            Utils.notification("Remove owner transaction sent, will be mined in next 20s");
            Transaction.add({txHash: tx, callback: function(){
              Utils.success("Remove owner transaction mined, might require more wallet owner's confirmations");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.sign = function(){
        Wallet.removeOwnerOffline(wallet.address, $scope.owner, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            Utils.signed(tx);
          }
        });
      }

      $scope.getNonce = function(){
        var data = Wallet.getRemoveOwnerData(wallet.address, $scope.owner);
        Wallet.getNonce(wallet.address, wallet.address, "0x0", data, function(e, nonce){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            // Open modal
            $uibModalInstance.close();
            Utils.success("Multisig Nonce: "+nonce.toNumber());
          }
        }).call();
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
