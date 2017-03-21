(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function ($scope, Wallet, Utils, $window, $uibModal) {
      $scope.config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));

      function showHideAuthCodeBtn () {
        $scope.showDeleteAuthCodeBtn = $scope.config.authCode ? true : false;
      }

      showHideAuthCodeBtn(); // call on page loading

      $scope.update = function () {
        localStorage.setItem("userConfig", JSON.stringify($scope.config));

        if (!$window.web3) {
          Wallet.web3 = new Web3($scope.config.ethereumNode);
        }

        Utils.success("Configuration updated successfully.");
        showHideAuthCodeBtn();
      };

      $scope.reset = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/resetSettings.html',
          size: 'md',
          controller: function ($uibModalInstance, $scope) {
            $scope.ok = function () {
              $uibModalInstance.close();
              localStorage.removeItem("userConfig");
              Object.assign(txDefault, txDefaultOrig);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function () {
            Utils.success("Configuration reseted successfully.");
            $scope.config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));
          }
        );
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

      /**
      * Delete a DAPP and its alerts/notifications
      */
      $scope.remove = function () {

        $uibModal.open({
          templateUrl: 'partials/modals/deleteDApp.html',
          size: 'md',
          scope: $scope,
          controller: function ($uibModalInstance, $scope, EthAlerts) {
            $scope.showLoadingSpinner = false;

            $scope.ok = function () {
              $scope.showLoadingSpinner = true;
              
              EthAlerts.delete().then(
                function successCallback(response) {
                  $uibModalInstance.close();
                },
                function errorCallback(response) {
                  var errorMessage = "";
                  if (response.status = -1) {
                    errorMessage = 'An error occurred. Please verify whether Gnosis Alert Node is setted correctly.';
                  }
                  else {
                    Object.keys(response.data).map(function (error) {
                      errorMessage += "<b>" + error + "</b>: ";
                      errorMessage += response.data[error];
                      errorMessage += "<br/>";
                    });
                  }
                  Utils.dangerAlert(errorMessage);
                }
              )
              .finally(function () {
                $scope.showLoadingSpinner = false;
              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function () {
            // Show success message
            Utils.success("Authorization code was deleted successfully.");
            // Remove authCode from configuration JSON
            var config = JSON.parse(localStorage.getItem("userConfig"));
            delete config.authCode;
            delete txDefault.authCode;
            localStorage.setItem("userConfig", JSON.stringify(config));
            $scope.config = config;

            // $scope.showDeleteAuthCodeBtn = false;
            showHideAuthCodeBtn();
          }
        );
      };

    });
  }
)();
