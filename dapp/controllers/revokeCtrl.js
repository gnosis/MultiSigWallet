(
  function () {
    angular
    .module("multiSigWeb")
    .controller("revokeCtrl", function ($scope, txId, address, Wallet, Transaction, $uibModalInstance, Utils) {
      $scope.send = function () {
        Wallet.revokeConfirmation(address, txId, {onlySimulate: false}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.notification("Revoke confirmation transaction was sent.");
            Transaction.add({txHash: tx, callback: function () {
              Utils.success("Revoke confirmation transaction was mined.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.sign = function (){
        Wallet.revokeConfirmationOffline(address, txId, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else{
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      };

      $scope.cancel = function (){
        $uibModalInstance.dismiss();
      };
    });
  }
)();
