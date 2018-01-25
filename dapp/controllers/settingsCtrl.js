(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function (Web3Service, $scope, Config, Wallet, Utils, Transaction, $window, $uibModal, $sce, $location) {

      // Don't save the following config values to localStorage
      var configBlacklist = [
        "alertNodes", "alertNodesList", "ethereumNodes", "selectedEthereumNode", 
        "walletFactoryAddresses", "selectedWalletFactoryAddress"
      ];

      /**
      * Sets the complete url to the Alert (notifications) management page
      */
      function alertNodeSetup () {
        if ($scope.config.alertNode && $scope.config.alertNode.authCode) {
          if (!$scope.config.alertNode.managementPage) {
            if ($scope.config.alertNode.url.endsWith('/')) {
              $scope.config.alertNode.managementPage = $scope.config.alertNode.url + txDefaultOrig.alertNode.managementRoute + '/?code={auth-code}';
            }
            else {
              $scope.config.alertNode.managementPage = $scope.config.alertNode.url + '/' + txDefaultOrig.alertNode.managementRoute + '/?code={auth-code}';
            }
          }
          $scope.alertManagementPage = $scope.config.alertNode.managementPage.replace('{auth-code}', $scope.config.alertNode.authCode);          
        }              
      };

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

        // Automatically get ETH chain and set the proper alert node
        Transaction.getEthereumChain().then(
          function (data) {
            var factoryAddress;
            var alertNode;

            if (data.chain == 'kovan') {
              factoryAddress = $scope.config.walletFactoryAddresses['kovan'];
              alertNode = $scope.config.alertNodes['kovan'];
            }
            else if (data.chain == 'ropsten') {
              factoryAddress = $scope.config.walletFactoryAddresses['ropsten'];
              alertNode = $scope.config.alertNodes['ropsten'];
            }
            else if (data.chain == 'privatenet') {
              factoryAddress = $scope.config.walletFactoryAddresses['privatenet'];
              alertNode = $scope.config.alertNodes['privatenet'];
            }
            else {
              factoryAddress = $scope.config.walletFactoryAddresses['mainnet'];
              alertNode = $scope.config.alertNodes['mainnet'];
            }

            factoryAddress.name = 'Automatic';
            alertNode.name = 'Automatic';

            // Get the current wallet factory address object, 
            // we have to search inside the walletFactoryAddresses object
            var walletFactoryKeys = Object.keys($scope.config.walletFactoryAddresses);            
            var currentWalletFactory;
            
            for (var x=0; x<walletFactoryKeys.length; x++) {              
              if ($scope.config.walletFactoryAddresses[walletFactoryKeys[x]].address == $scope.config.walletFactoryAddress) {
                currentWalletFactory = $scope.config.walletFactoryAddresses[walletFactoryKeys[x]];
                break;
              }
            }

            // Set the new wallet factory address only if the Automatic mode is setted, currentWalletFactory
            // is undefined when using custom addresses
            if (currentWalletFactory) {
              $scope.config.walletFactoryAddress = factoryAddress;
            }
            else {
              $scope.config.walletFactoryAddress = {
                'address': $scope.config.walletFactoryAddress, 
                'name': 'Custom node'
              };
            }

            $scope.config.walletFactoryAddressList = [factoryAddress]; // Needed by the ui drop-down select list

            // Set the new alertNode only if the Automatic mode is setted
            if ($scope.config.alertNode && $scope.config.alertNode.name != 'Custom node') {
              $scope.config.alertNode = alertNode;
            }

            $scope.config.alertNodesList = [alertNode]; // Needed by the ui drop-down select list

          }
        );        

        alertNodeSetup();

      }

      loadConfig();

      /**
      * Shows/hides 'Delete Auth Code' button
      */
      function showHideAuthCodeBtn () {
        $scope.showDeleteAuthCodeBtn = $scope.config.alertNode ? $scope.config.alertNode.authCode ? true : false : false;

        if ($scope.showDeleteAuthCodeBtn) {
          setAlertManagementPage();
        }
      }

      showHideAuthCodeBtn(); // called on page loading

      /**
      * Updates configuration
      */
      $scope.update = function () {
        // Current saved configuration
        var previousConfig = Config.getConfiguration('userConfig');
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

        // If we're using lightwallet for 1st time,
        // redirect the user to accounts/add page
        if (configCopy.wallet == 'lightwallet' && previousConfig.wallet != 'lightwallet'
            && !Config.getConfiguration('accounts')) {
          Config.setConfiguration('showCreateWalletModal', true);
          $location.path('/accounts');
        }

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
            var config = Config.getUserConfiguration();
            delete config.alertNode.authCode;
            delete txDefault.alertNode.authCode;
            Config.setConfiguration("userConfig", JSON.stringify(config));
            loadConfig();

            showHideAuthCodeBtn();
          }
        );
      };

    });
  }
)();
