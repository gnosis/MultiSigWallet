(
  function () {
    angular
    .module("multiSigWeb")
    .controller("importWalletConfigCtrl", function ($rootScope, $scope, $uibModalInstance, Utils, Wallet) {

      $scope.configuration = "";

      /**
      * Loads a JSON script containing the wallets configuration
      */
      $scope.load = function () {
        if($scope.configuration && $scope.configuration.trim() !== ""){
            // Setting up new configuration
            try {
              Wallet.import($scope.configuration);
              // Show success message
              Utils.success("Configuration imported successfully.");

              $scope.close();
            } catch (err) {
              // An error occurred
              Utils.dangerAlert("Please provide a valid JSON configuration script.");
            }

            try {
              $rootScope.$digest();
            }
            catch (e) {}

        } else {
          Utils.dangerAlert("Please provide a valid JSON configuration script.");
        }
      };

      /**
      * Close the modal instance
      */
      $scope.close = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
