(
  function () {
    angular
    .module("multiSigWeb")
    .controller("exportWalletConfigCtrl", function ($scope, $uibModalInstance, Utils) {

      // Obtaining wallets json
      $scope.configuration = localStorage.getItem("wallets") || "";

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
