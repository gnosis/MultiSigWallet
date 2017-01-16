(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmTransactionCtrl", function ($scope, txId, address, Wallet, Transaction, $uibModalInstance, Utils) {
      $scope.send = function () {
        Wallet.confirmTransaction(address, txId, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.notification("Confirmation transaction was sent.");
            Transaction.add({txId: tx, callback: function () {
              Utils.success("Confirmation transaction was mined.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.sign = function () {
        Wallet.confirmTransactionOffline(address, txId, function (e, tx){
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
