(
  function () {
    angular
    .module("multiSigWeb")
    .controller("replaceOwnerOfflineCtrl", function ($scope, Wallet, Utils, wallet, $uibModalInstance) {
      $scope.sign = function () {
        Wallet.replaceOwnerOffline(wallet.address, $scope.oldOwner, $scope.newOwner, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.signed(tx);
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
