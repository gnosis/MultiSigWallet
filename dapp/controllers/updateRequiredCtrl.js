(
  function(){
    angular
    .module("multiSigWeb")
    .controller("updateRequiredCtrl", function($scope, Wallet, Transaction, $routeParams, Utils, $uibModalInstance, wallet){
      $scope.address = wallet.address;


      Wallet
      .getRequired($scope.address, function(e, required){
        $scope.required = required.toNumber();
        $scope.$apply();
      }).call();


      $scope.update = function(){
        Wallet.updateRequired($scope.address, $scope.required, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            Utils.notification("Transaction sent, will be mined in next 20s");
            Transaction.add({txHash: tx, callback: function(receipt){
              Utils.success("Required confirmations changed");
            }});
          }
        });
      }

      $scope.signOffline = function(){
        Wallet.signUpdateRequired($scope.address, $scope.required, function(e, tx){
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
        var data = Wallet.getUpdateRequiredData($scope.address, $scope.required);
        Wallet.getNonce($scope.address, $scope.address, "0x0", data, function(e, nonce){
          // Open modal
          $uibModalInstance.close();
          Utils.success("Multisig Nonce: "+nonce.toNumber());
        }).call();
      }

      $scope.cancel = function(){
        $uibModalInstance.dismiss();
      }
    });
  }
)();
