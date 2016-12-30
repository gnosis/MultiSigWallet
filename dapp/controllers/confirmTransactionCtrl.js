(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmTransactionCtrl", function ($scope, txHash, address, Wallet, Transaction, $uibModalInstance, Utils) {
      $scope.send = function () {
        Wallet.confirmTransaction(address, txHash, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.notification("Confirmation transaction was sent.");
            Transaction.add({txHash: tx, callback: function () {
              Utils.success("Confirmation transaction was mined.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.sign = function () {
        Wallet.confirmTransactionOffline(address, txHash, function (e, tx){
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
