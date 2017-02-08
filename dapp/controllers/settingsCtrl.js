(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function ($scope, Wallet, Utils, $window, $uibModal) {
      $scope.config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));

      $scope.update = function () {
        localStorage.setItem("userConfig", JSON.stringify($scope.config));

        if (!$window.web3) {
          Wallet.web3 = new Web3($scope.config.ethereumNode);
        }

        Utils.success("Configuration updated successfully.");
      };

      /**
      * Shows the wallets configuration export dialog
      */
      $scope.showExportWalletDialog = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/exportWalletConfiguration.html',
          size: 'md',
          controller: 'exportWalletConfigCtrl'
        });
      };
      /**
      * Shows the wallets configuration import dialog
      */
      $scope.showImportWalletDialog = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/importWalletConfiguration.html',
          size: 'md',
          controller: 'importWalletConfigCtrl'
        });
      };

    });
  }
)();
