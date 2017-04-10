(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function (Web3Service, $scope, Wallet, Utils, $window, $uibModal, $sce) {

      // Don't save the following config values to localStorage
      var configBlacklist = [
        "alertNodes", "ethereumNodes", "selectedEthereumNode", "walletFactoryAddresses", "selectedWalletFactoryAddress"
      ];

      /**
      * Loads configuration
      */
      function loadConfig () {
        $scope.config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));
        // Maps variables used by ui-select
        $scope.config.selectedEthereumNode = {
          url: $scope.config.ethereumNode
        };
        $scope.config.selectedWalletFactoryAddress = {
          address: $scope.config.walletFactoryAddress
        };
      }

      loadConfig();

      /**
      * Shows/hides 'Delete Auth Code' button
      */
      function showHideAuthCodeBtn () {
        $scope.showDeleteAuthCodeBtn = $scope.config.alertNode.authCode ? true : false;
      }

      showHideAuthCodeBtn(); // called on page loading

      /**
      * Updates configuration
      */
      $scope.update = function () {
        // Wraps selectedEthereumNode.url to ethereumNode
        // See reverse mapping in loadConfig()
        if ($scope.config.selectedEthereumNode) {
            $scope.config.ethereumNode = $scope.config.selectedEthereumNode.url;
        }

        // Wraps selectedWalletFactoryAddress.address to walletFactoryAddress
        if ($scope.config.selectedWalletFactoryAddress) {
          $scope.config.walletFactoryAddress = $scope.config.selectedWalletFactoryAddress.address;
        }
        // Create a config copy
        var configCopy = {};
        angular.copy($scope.config, configCopy);

        // Check values blacklist
        Object.keys(configCopy).map(function (item) {
            if (configBlacklist.indexOf(item) !== -1) {
              delete configCopy[item];
            }
        });

        localStorage.setItem("userConfig", JSON.stringify(configCopy));
        if (Web3Service.web3.currentProvider.constructor.name == "HttpProvider") {
          Web3Service.web3 = new Web3( new Web3.providers.HttpProvider($scope.config.ethereumNode));
          $window.web3 = Web3Service.web3;
        }

        loadConfiguration(); // config.js

        Utils.success("Configuration updated successfully.");
        showHideAuthCodeBtn();
      };

      /**
      * Adds a new custon ui-select item to Alert Node
      */
      $scope.addCustomAlertNode = function(param) {
        var item = {
           url: param,
           authCode: null
         };
         return item;
      };

      /**
      * Adds a new custon ui-select item to Ethereum Node
      */
      $scope.addCustomEthereumNode = function(param) {
        var item = {
          url: param
        };
        return item;
      };

      /**
      * Adds a new custon ui-select item to Wallet Factory Address
      */
      $scope.addCustomWalletFactoryAddress = function(param) {
        var item = {
          address: param
        };
        return item;
      };

      /**
      * Sanitizes HTML
      */
      $scope.toHtml = function (input) {
        return $sce.trustAsHtml(input);
      };

      /**
      *
      */
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
            loadConfig();
            Utils.success("Configuration reseted successfully.");
            //$scope.config = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));
            showHideAuthCodeBtn();
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
            delete config.alertNode.authCode;
            delete txDefault.alertNode.authCode;
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
