(
  function () {
    angular
    .module("multiSigWeb")
    .controller("confirmMultisigTransactionOfflineCtrl", function ($scope, address, Wallet, $uibModalInstance, Utils) {

      $scope.transactionId = null;

      $scope.signOffline = function () {
        Wallet.confirmTransactionOffline(address, $scope.transactionId, function (e, tx){
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

        Wallet.revokeConfirmationOffline(address, $scope.transactionId, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else{
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });

      };

      $scope.executeOffline = function () {

        Wallet.executeTransactionOffline(address, $scope.transactionId, function (e, tx) {
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
