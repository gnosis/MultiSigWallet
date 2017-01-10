(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmMultisigTransactionOfflineCtrl", function ($scope, address, Wallet, Transaction, $uibModalInstance, Utils) {

      $scope.transactionHash = null;

      $scope.signOffline = function () {
        Wallet.confirmTransactionOffline(address, $scope.transactionHash, function (e, tx){
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      };

      $scope.revokeOffline = function () {

        Wallet.revokeConfirmationOffline(address, $scope.transactionHash, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
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
