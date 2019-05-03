(
  function () {
    angular
    .module("multiSigWeb")
    .controller("exportWalletConfigCtrl", function ($scope, $uibModalInstance, Utils, Wallet, ABI) {

      $scope.exportOptions = {
        addressBook: false,
        wallets: true
      };

      function getConfiguration () {
        var config = {};
        config.wallets = JSON.parse(localStorage.getItem("wallets")) || {};
        config.abis =ABI.get();

        if ($scope.exportOptions.addressBook) {
          config.addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');
        }

        var validConfig = Wallet.getValidConfigFromJSON(config || "", 'export');
        return JSON.stringify(validConfig);
      }

      $scope.setConfiguration = function () {
        $scope.configuration = getConfiguration();
      };

      // Set initial configuration, users can then filter which properties to export
      $scope.setConfiguration();

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
