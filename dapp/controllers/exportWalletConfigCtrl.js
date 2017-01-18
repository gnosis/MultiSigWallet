(
  function () {
    angular
    .module("multiSigWeb")
    .controller("exportWalletConfigCtrl", function ($scope, $uibModalInstance, Utils, Wallet) {

      $scope.configuration = JSON.stringify(Wallet.getValidConfigFromJSON(JSON.parse(localStorage.getItem("wallets")) || "", 'export'));

      $scope.close = function () {
        $uibModalInstance.dismiss();
      };

      $scope.copy = function () {
        Utils.success("Configuration has been copied to clipboard.");
        $uibModalInstance.dismiss();
      };

    });
  }
)();
