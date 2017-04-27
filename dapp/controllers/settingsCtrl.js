(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function (Web3Service, $scope, Config, Wallet, Utils, $window, $uibModal, $sce) {

      // Don't save the following config values to localStorage
      var configBlacklist = [
        "alertNodes", "ethereumNodes", "selectedEthereumNode", "walletFactoryAddresses", "selectedWalletFactoryAddress"
      ];

      /**
      * Loads configuration
      */
      function loadConfig () {
        $scope.config = Config.getUserConfiguration();
        // Maps variables used by ui-select
        var selectedEthereumNode = $scope.config.ethereumNodes.filter(function (item) { return item.url == $scope.config.ethereumNode; });
        $scope.config.selectedEthereumNode = {
          url: $scope.config.ethereumNode,
          name: selectedEthereumNode.length == 1 ? selectedEthereumNode[0].name : 'Custom node'
        };

        for (var x in $scope.config.ethereumNodes) {
          var item = $scope.config.ethereumNodes[x];

          if (item.url == $scope.config.ethereumNode) {
            $scope.config.selectedEthereumNode.name = item.name;
            break;
          }
        }

        var walletContractCount = 0;
        for (var x in $scope.config.walletFactoryAddresses) {
          var item = $scope.config.walletFactoryAddresses[x];

          if (item.address == $scope.config.walletFactoryAddress) {
            $scope.config.walletFactoryAddress = {name:item.name, address: item.address};
            break;
          }

          if (walletContractCount == $scope.config.walletFactoryAddresses.length-1) {
            $scope.config.walletFactoryAddress = {name:'Custom contract', address: $scope.config.walletFactoryAddress};
            break;
          }

          walletContractCount++;
        }

      }

      loadConfig();

      /**
      * Shows/hides 'Delete Auth Code' button
      */
      function showHideAuthCodeBtn () {
        $scope.showDeleteAuthCodeBtn = $scope.config.alertNode ? $scope.config.alertNode.authCode ? true : false : false;
      }

      showHideAuthCodeBtn(); // called on page loading

      /**
      * Updates configuration
      */
      $scope.update = function () {
        // Create a config copy
        var configCopy = {};
        angular.copy($scope.config, configCopy);

        // Wraps selectedEthereumNode.url to ethereumNode
        // See reverse mapping in loadConfig()
        if (configCopy.selectedEthereumNode) {
          if (!configCopy.selectedEthereumNode.url) {
            Utils.dangerAlert({message:'Please specify an ethereum node.'});
            return;
          }
          configCopy.ethereumNode = configCopy.selectedEthereumNode.url;
        }

        // Wraps selectedWalletFactoryAddress.address to walletFactoryAddress
        if (configCopy.walletFactoryAddress) {
          if (!configCopy.walletFactoryAddress.address) {
            Utils.dangerAlert({message:'Please specify a wallet factory contract.'});
            return;
          }
          configCopy.walletFactoryAddress = configCopy.walletFactoryAddress.address;
        }

        // Check blacklist values
        Object.keys(configCopy).map(function (item) {
            if (configBlacklist.indexOf(item) !== -1) {
              delete configCopy[item];
            }
        });
        // Save new configuation
        Config.setConfiguration("userConfig", JSON.stringify(configCopy));

        /*if (Web3Service.web3.currentProvider.constructor.name == "HttpProvider") {
          Web3Service.web3 = new Web3( new Web3.providers.HttpProvider($scope.config.ethereumNode));
          $window.web3 = Web3Service.web3;
        }*/

        loadConfiguration(); // config.js

        // Reload we3 provider
        Web3Service.reloadWeb3Provider();

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
          url: param,
          name: param
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
              Config.removeConfiguration("userConfig");
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
            //localStorage.setItem("userConfig", JSON.stringify(config));
            Config.setConfiguration("userConfig", JSON.stringify(config));
            $scope.config = config;

            showHideAuthCodeBtn();
          }
        );
      };

    });
  }
)();
