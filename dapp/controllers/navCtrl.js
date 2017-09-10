(
  function () {
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function ($scope, Wallet, Web3Service, Config, Connection, Transaction, $interval, $sce, $location, $uibModal, Utils) {
      $scope.navCollapsed = true;
      $scope.isElectron = isElectron;
      $scope.config = Config.getConfiguration();

      // Reload config when it changes
      $scope.$watch(
        function () {
          return Config.updates;
        },
        function () {
          $scope.config = Config.getUserConfiguration();
        }
      );

      /**
      * Shows the Web3 provider selection modal
      */
      function showWeb3SelectionModal () {
        $uibModal.open({
          templateUrl: 'partials/modals/chooseWeb3Wallet.html',
          size: 'md',
          backdrop: 'static',
          windowClass: 'bootstrap-dialog type-info',
          controller: function ($scope, $uibModalInstance) {
            $scope.config = Config.getUserConfiguration();

            $scope.ok = function (option) {
              $scope.config.wallet = option;
              // Save new configuation
              Config.setConfiguration("userConfig", JSON.stringify($scope.config));
              loadConfiguration(); // config.js
              // Reload we3 provider
              Web3Service.reloadWeb3Provider();
              Utils.success("Welcome, you can start using your Multisignature Wallet.");
              Config.setConfiguration('chooseWeb3ProviderShown', true);
              $uibModalInstance.close();
            };
          }
        });
      }

      // If not terms acepted, prompt disclaimer
      var termsAccepted = localStorage.getItem("termsAccepted");

      if (!termsAccepted) {
        if (isElectron) {
          $uibModal.open({
            templateUrl: 'partials/modals/disclaimerElectron.html',
            size: 'md',
            backdrop: 'static',
            windowClass: 'bootstrap-dialog type-danger',
            controller: function ($scope, $uibModalInstance) {
              $scope.ok = function () {
                $uibModalInstance.close($scope.walletOption);
                localStorage.setItem("termsAccepted", true);
                // call web3 selection modal
                showWeb3SelectionModal();
              };
            }
          });
        }
        else {
          $uibModal.open({
            templateUrl: 'partials/modals/disclaimer.html',
            size: 'md',
            backdrop: 'static',
            windowClass: 'bootstrap-dialog type-danger',
            controller: function ($scope, $uibModalInstance) {
              $scope.ok = function () {
                $uibModalInstance.close($scope.walletOption);
                localStorage.setItem("termsAccepted", true);
              };
            }
          });
        }
      }


      $scope.updateInfo = function () {

        /**
        * Setup Ethereum Chain infos
        */
        Transaction.getEthereumChain().then(
          function (data) {
            $scope.ethereumChain = data;
            txDefaultOrig.walletFactoryAddress = data.walletFactoryAddress;
            loadConfiguration(); // config.js
          }
        );

        if (isElectron || !$scope.paramsPromise) {
          // init params
          $scope.paramsPromise = Wallet.initParams().then(function () {
            $scope.loggedIn = Web3Service.coinbase;
            $scope.coinbase = Web3Service.coinbase;
            $scope.nonce = Wallet.txParams.nonce;
            $scope.balance = Wallet.balance;
            $scope.paramsPromise = null;

            if (!isElectron) {
              $scope.accounts = Web3Service.accounts;
            }
            else {
              // Retrieves accounts from localStorage
              if (Config.getConfiguration('accounts')) {
                $scope.accounts = Config.getConfiguration('accounts').map(function (account) {
                  return account.address;
                });
              }
              else {
                $scope.accounts = [];
              }
            }
          }, function (error) {
            if (txDefault.wallet == "ledger") {
              $scope.loggedIn = true;
              $scope.accounts = Web3Service.accounts;
              $scope.coinbase = Web3Service.coinbase;
              $scope.nonce = Wallet.txParams.nonce;
              $scope.paramsPromise = null;
            }
            else {
              var syncErrorShown = Config.getConfiguration('syncErrorShown');
              if (!syncErrorShown) {
                Utils.dangerAlert(error);
                Config.setConfiguration('syncErrorShown', true);
              }
            }
          });
        }

        return $scope.paramsPromise;
      };

      /**
      * Updates connection status
      */
      $scope.statusIcon = $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i>');

      $scope.updateConnectionStatus = function () {
        $scope.$watch(function(){
          $scope.connectionStatus = Connection.isConnected;
          $scope.statusIcon = Connection.isConnected ? $sce.trustAsHtml('Online <i class=\'fa fa-circle online-status\' aria-hidden=\'true\'></i>') : $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i> Offline <i class=\'fa fa-circle offline-status\' aria-hidden=\'true\'></i>');
        });

      };

      Web3Service.webInitialized.then(
        function () {
          $scope.interval = $interval($scope.updateInfo, 5000);

          /**
          * Lookup connection status
          * Check connectivity first on page loading
          * and then at time interval
          */
          Connection.checkConnection();
          $scope.updateConnectionStatus();
          $scope.connectionInterval = $interval($scope.updateConnectionStatus, txDefault.connectionChecker.checkInterval);

          $scope.updateInfo().then(function () {
            var chooseWeb3ProviderShown = Config.getConfiguration('chooseWeb3ProviderShown');
            if (termsAccepted && !chooseWeb3ProviderShown && isElectron) {
              // show selection modal
              showWeb3SelectionModal();
            }
            else if (termsAccepted && !isElectron && !Web3Service.coinbase
                && txDefault.wallet !== "ledger" && txDefault.wallet !== 'lightwallet') {
              $uibModal.open({
                templateUrl: 'partials/modals/web3Wallets.html',
                size: 'md',
                backdrop: 'static',
                windowClass: 'bootstrap-dialog type-info',
                controller: function ($scope, $uibModalInstance) {
                  $scope.ok = function () {
                    $uibModalInstance.close();
                  };
                }
              });
            }
          });
        }
      );

      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
      });

      $scope.selectAccount = function (account) {
        Web3Service.selectAccount(account);
        $scope.updateInfo();
      };

      $scope.getMenuItemClass = function (path) {
        if ($location.path() == path) {
          return 'active';
        }
      };
    });
  }
)();
