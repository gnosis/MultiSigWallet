(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmMultisigTransactionOfflineCtrl", function ($scope, address, Wallet, Transaction, $uibModalInstance, Utils) {

      $scope.transactionId = null;

      $scope.signOffline = function () {
        Wallet.confirmTransactionOffline(address, $scope.transactionId, function (e, tx){
          if (e) {
            // Don't show Tx Sign Rejected errors
            // Utils.dangerAlert(e);
          }
          else {
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      };

      $scope.revokeOffline = function () {

        Wallet.revokeConfirmationOffline(address, $scope.transactionId, function (e, tx) {
          if (e) {
            // Don't show Tx Sign Rejected errors
            // Utils.dangerAlert(e);
          }
          else{
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
