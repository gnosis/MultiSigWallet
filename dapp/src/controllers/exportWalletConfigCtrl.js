(
  function () {
    angular
    .module("multiSigWeb")
    .controller("exportWalletConfigCtrl", function ($scope, $uibModalInstance, Utils, Wallet, ABI) {

      function getConfiguration () {
        var config = {};
        config.wallets = JSON.parse(localStorage.getItem("wallets")) || {};
        config.abis =ABI.get();
        var validConfig = Wallet.getValidConfigFromJSON(config || "", 'export');
        return JSON.stringify(validConfig);
      }

      $scope.configuration = getConfiguration();

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
