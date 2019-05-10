(
  function () {
    angular
      .module('multiSigWeb')
      .controller('navCtrl', function ($scope, $sce, $location, $uibModal, Wallet, Web3Service, Config, CommunicationBus, Connection, Transaction, Utils) {
        $scope.navCollapsed = true;
        $scope.isElectron = isElectron;
        $scope.config = Config.getConfiguration();
        $scope.metamaskInjected = Web3Service.isMetamaskInjected();
        $scope.web3ProviderName = null;

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
        function showWeb3SelectionModal() {
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
                Web3Service.webInitialized().then(function () {
                  Config.setConfiguration('chooseWeb3ProviderShown', true);
                  setTimeout($uibModalInstance.close, 1000);

                  Utils.success("Welcome, you can start using your Multisignature Wallet.");
                  // Update info on regular interval
                  CommunicationBus.startInterval('updateInfo', txDefault.accountsChecker.checkInterval);
                });
              };
            }
          });
        }

        // If not terms acepted, prompt disclaimer
        var gdprTermsAccepted = localStorage.getItem("gdprTermsAccepted");

        if (!gdprTermsAccepted) {
            $uibModal.open({
              templateUrl: isElectron ? 'partials/modals/disclaimerElectron.html' : 'partials/modals/disclaimer.html',
              size: 'md',
              backdrop: 'static',
              windowClass: 'bootstrap-dialog type-danger',
              controller: function ($scope, $uibModalInstance) {
                if (isElectron) {
                  $scope.ok = function () {
                    $uibModalInstance.close($scope.walletOption);
                    localStorage.setItem("gdprTermsAccepted", true);
                    // call web3 selection modal
                    showWeb3SelectionModal();
                  };
                } else {
                  $scope.ok = function () {
                    $uibModalInstance.close($scope.walletOption);
                    localStorage.setItem("gdprTermsAccepted", true);
                  };
                  $scope.websites = txDefault.websites;
                }

                $scope.openTerms = function() {
                  Utils.openResource(txDefault.resources.termsOfUse);
                }
        
                $scope.openPolicy = function () {
                  Utils.openResource(txDefault.resources.privacyPolicy);
                }
        
                $scope.openImprint = function () {
                  Utils.openResource(txDefault.resources.imprint);
                }
              }
            });
        }

        /**
        * Opens Metamask widget and asks the user to allow the DApp accessing the accounts
        */
        $scope.openMetamaskWidget = function (resolve, reject) {
          // Ask to reload provider, it takes care of re-ejecuting metamask checks.
          Web3Service.enableMetamask(function (error) {
            if (error && reject) {
              $scope.loggedIn = false;
              reject();
            }
            else if (!error) {
              $scope.loggedIn = true;
              if (resolve) {
                resolve();
              }
            }
          });
        };


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

          // init params
          $scope.paramsPromise = Wallet.initParams().then(function () {
            $scope.loggedIn = !isElectron ? (Web3Service.coinbase !== undefined && Web3Service.coinbase !== null) : true;
            $scope.coinbase = Web3Service.coinbase;
            $scope.nonce = Wallet.txParams.nonce;
            $scope.balance = Wallet.balance;
            $scope.paramsPromise = null;

            if (!isElectron) {
              $scope.accounts = Web3Service.accounts;
            }
            else {
              // Retrieves accounts from localStorage, only if we're using the lightwallet
              if (txDefault.wallet == "lightwallet" && Config.getConfiguration('accounts')) {
                $scope.accounts = Config.getConfiguration('accounts').map(function (account) {
                  return account.address;
                });
              }
              else {
                var accounts = Web3Service.accounts;
                $scope.accounts = accounts || [];
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
            else if (txDefault.wallet == "lightwallet") {
              // Retrieves accounts from localStorage, cannot get them from the injected web3 as we
              // are offline
              if (Config.getConfiguration('accounts')) {
                $scope.accounts = Config.getConfiguration('accounts').map(function (account) {
                  return account.address;
                });

                if (Web3Service.coinbase) {
                  $scope.coinbase = Web3Service.coinbase;
                }
                else {
                  $scope.coinbase = $scope.accounts[0];
                }

                $scope.loggedIn = true;
              }
              else {
                $scope.loggedIn = false;
              }
            }
            else {
              var syncErrorShown = Config.getConfiguration('syncErrorShown');
              if (!syncErrorShown) {
                Utils.dangerAlert(error);
                Config.setConfiguration('syncErrorShown', true);
              }
            }
          });

          return $scope.paramsPromise;
        };

        /**
        * Updates connection status
        */
        $scope.statusIcon = $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i>');

        $scope.updateConnectionStatus = function () {
          $scope.connectionStatus = Connection.isConnected;
          $scope.statusIcon = Connection.isConnected ? $sce.trustAsHtml('Online <i class=\'fa fa-circle online-status\' aria-hidden=\'true\'></i>') : $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i> Offline <i class=\'fa fa-circle offline-status\' aria-hidden=\'true\'></i>');
        };

        /**
        * Initialize web3
        */
        function startup() {
          var updateInfoIdx = CommunicationBus.addFn($scope.updateInfo, 'updateInfo');
          var updateConnStatusIdx = CommunicationBus.addFn($scope.updateConnectionStatus, 'updateConnectionStatus');
          var checkReceiptsIdx = CommunicationBus.addFn(Transaction.checkReceipts, 'checkReceipts');

          Web3Service.webInitialized().then(
            function () {
              /**
              * Lookup connection status
              * Check connectivity first on page loading
              * and then at time interval
              */
              CommunicationBus.startInterval(updateConnStatusIdx, txDefault.connectionChecker.checkInterval);
              $scope.updateConnectionStatus();

              $scope.web3ProviderName = txDefault.wallet;

              $scope.updateInfo().then(function () {
                // Start Tx receipts checker
                CommunicationBus.startInterval(checkReceiptsIdx, txDefault.transactionChecker.checkInterval);

                var chooseWeb3ProviderShown = Config.getConfiguration('chooseWeb3ProviderShown');
                if (gdprTermsAccepted && !chooseWeb3ProviderShown && isElectron) {
                  // show selection modal
                  showWeb3SelectionModal();
                }
                else if (gdprTermsAccepted && !isElectron && !Web3Service.coinbase
                  && txDefault.wallet !== "ledger" && txDefault.wallet !== 'lightwallet') {
                  // Do lookup on regular interval
                  CommunicationBus.startInterval(updateInfoIdx, txDefault.accountsChecker.checkInterval);

                  $uibModal.open({
                    templateUrl: 'partials/modals/web3Wallets.html',
                    size: 'md',
                    backdrop: 'static',
                    windowClass: 'bootstrap-dialog type-info',
                    scope: $scope,
                    controller: function ($scope, $uibModalInstance) {
                      $scope.ok = function () {
                        $uibModalInstance.close();
                      };

                      $scope.metamaskInjected = Web3Service.isMetamaskInjected();


                      $scope.openMetamaskWidgetAndClose = function () {
                        $scope.openMetamaskWidget(function () {
                          $scope.ok();
                        }, function () {
                          // DO nothing, user rejected unlocking Metamask
                        });
                      };
                    }
                  });
                } else {
                  // Do lookup on regular interval
                  CommunicationBus.startInterval(updateInfoIdx, txDefault.accountsChecker.checkInterval);
                }
              });
            },
            function (error) {
              // do nothing
            }
          );
        }

        /**
        * STARTUP FUNCTION
        */
        startup();

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
