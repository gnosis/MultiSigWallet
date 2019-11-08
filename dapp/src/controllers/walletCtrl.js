(
  function () {
    angular
      .module('multiSigWeb')
      .controller('walletCtrl', function ($rootScope, $scope, $uibModal, $window, CommunicationBus, Token, Utils, Wallet, Web3Service) {

        $scope.checkTerms = function () {
          if (localStorage.getItem("termsAccepted")) {
            CommunicationBus.stopInterval('termsInterval');
            $scope.newWalletSelect();
          };
        };

        $scope.wallets = {};

        $scope.$watch(
          function () {
            return Wallet.updates;
          },
          function () {
            var walletsToCopy = Wallet.getAllWallets();

            for (wallet in walletsToCopy) {
              if (!$scope.wallets[wallet]) {
                $scope.wallets[wallet] = {};
              }
              Object.assign($scope.wallets[wallet], walletsToCopy[wallet]);
            }

            // Remove removed wallets
            for (wallet in $scope.wallets) {
              if (!walletsToCopy[wallet]) {
                delete $scope.wallets[wallet];
              }
            }
            $scope.totalItems = Object.keys($scope.wallets).length;
          }
        );

        $scope.updateParams = function () {
          $scope.batch = Web3Service.web3.createBatch();
          if ($scope.wallets) {
            // Init wallet balance of each wallet address
            Object.keys($scope.wallets).map(function (address) {
              $scope.batch.add(
                Wallet.getBalance(
                  address,
                  function (e, balance) {
                    if (!e && balance && $scope.wallets[address]) {
                      $scope.$apply(function () {
                        $scope.wallets[address].balance = balance;
                      });
                    }
                  }
                )
              );

              $scope.batch.add(
                Wallet.getRequired(
                  address,
                  function (e, confirmations) {
                    if ($scope.wallets[address] && confirmations && confirmations.greaterThan(0)) {
                      $scope.$apply(function () {
                        $scope.wallets[address].confirmations = confirmations;
                      });
                    }
                  }
                )
              );

              /**
              * Get owners in order to verify whether or not the wallet
              * was created using the current network
              */
              $scope.batch.add(
                Wallet.getOwners(
                  address,
                  function (e, owners) {
                    // $scope.wallets[address] is undefined
                    // when deleting a wallet and executing
                    // Wallet.getOwners in the meantime
                    if ($scope.wallets[address]) {
                      $scope.wallets[address].isOnChain = (!e && owners.length > 0);
                    }
                  }
                )
              );

              $scope.batch.add(
                Wallet.getLimit(
                  address,
                  function (e, limit) {
                    if (!e && limit && $scope.wallets[address]) {
                      $scope.$apply(function () {
                        $scope.wallets[address].limit = limit;
                      });
                    }
                  }
                )
              );

              $scope.batch.add(
                Wallet.calcMaxWithdraw(
                  address,
                  function (e, max) {
                    if (!e && max && $scope.wallets[address]) {
                      $scope.$apply(function () {
                        $scope.wallets[address].maxWithdraw = max;
                      });
                    }
                  }
                )
              );
            });
            $scope.batch.execute();
          }
          else {
            $scope.totalItems = 0;
          }
        };

        function startup() {
          CommunicationBus.addFn($scope.updateParams, 'interval');
          CommunicationBus.addFn($scope.checkTerms, 'termsInterval');
          CommunicationBus.startInterval('interval', 10000);

          $scope.wallets = Wallet.wallets;
          if (Web3Service.coinbase && (!$scope.wallets || !Object.keys($scope.wallets).length && !$rootScope.alreadyLogged)) {
            CommunicationBus.startInterval('termsInterval', 500);
          }
          $scope.updateParams();
          $rootScope.alreadyLogged = true;

          // The localStorage item is setted in
          // notificationsSignupConfirmationCtrl
          if (localStorage.getItem("show-signup-success")) {
            localStorage.removeItem("show-signup-success");
            Utils.success("Signup was completed successfully.");
          }

          // Check if user is pointing to an invalid Infura endpoint
          // regex covers:
          // https://infura.io/v3/PROJECT-ID
          // https://*.infura.io/v3/PROJECT-ID
          var validInfuraRegex = 'infura.io/v3/\\w+';
          if (txDefault.ethereumNode.indexOf('infura.io') > -1 && !txDefault.ethereumNode.match(validInfuraRegex)) {
            // user is pointing to an infura endpoint, but he's not using a PROJECT-ID.
            var SHOW_INFURA_ALERT_STORAGE_KEY = 'showInfuraEndpointAlert';
            if (!localStorage.getItem(SHOW_INFURA_ALERT_STORAGE_KEY)) {

              var infuraErrorMessage = "You're trying to connect to an invalid Infura endpoint that might lead to experience weird behaviours such as rate-limited requests." +
              " Please read about the new Infura's endpoints on the " +
              "<a href='https://infura.io/docs' target='_blank'>documentation</a> and discover how to create your project ID." +
              "<br/><br/>You can close this alert and read more on our <a href='https://github.com/gnosis/MultiSigWallet#how-to-set-a-custom-ethereum-node' target='_blank'>FAQs</a> afterwards." +
              "<br/><br/><h4>How to set the new endpoint on the Multisig</h4>" +
              "Once you have created the project ID on Infura and obtained the Infura endpoint, please set it on the Multisig by going " +
              "to <a href='#/settings'>settings</a> page.<br/><br/>On settings, click on <u>Ethereum Node</u>'s dropdown menu and select <u>Custom configuration</u>, " +
              "this would make the <u>Ethereum node</u>'s field editable. Please write your new <b>Infura endpoint</b> there. " +
              "<br/><br/>Remember, if Web3 Provider is set to Default (Metamask, Mist, Parity), Multisig will use the Ethereum Node " +
              "endpoint coming with the injected Web3 Provider, so in that case go to your Web3 Provider (Metamask for instance) " +
              "and update/switch your Ethereum Node endpoint.";

              BootstrapDialog.show({
                type: BootstrapDialog.TYPE_WARNING,
                title: 'Invalid Infura endpoint',
                message: infuraErrorMessage,
                buttons: [{
                  label: 'Don\'t ask again',
                  action: function(dialog) {
                    localStorage.setItem(SHOW_INFURA_ALERT_STORAGE_KEY, false)
                    dialog.close();
                  }
                }]
              });
            }
          }
        }

        // ========================
        // Execute startup function
        // ========================
        startup();

        $scope.$on('$destroy', function () {
          CommunicationBus.stopInterval('interval');
          CommunicationBus.stopInterval('termsInterval');
        });

        /**
         * Executes operations at page load
         */
        $window.onload = function () {
          // Convert `wallets`'s addresses to checksum addresses
          // We convert `wallets` to checksum addresses because some users might still
          // be using a not checksummed configuration, which was stored into the browser before
          // the user visited the current app version.
          var walletsData = JSON.parse(localStorage.getItem("wallets")) || {};
          walletsData = Wallet.toChecksummedWalletConfiguration(walletsData);
          localStorage.setItem('wallets', JSON.stringify(walletsData));

          // Convert transactions's addresses too
          var transactions = JSON.parse(localStorage.getItem("transactions")) || {};
          transactions = Web3Service.toChecksumAddress(transactions);
          localStorage.setItem('transactions', JSON.stringify(transactions));
        };

        /*$scope.currentPage = 1;
        $scope.itemsPerPage = 5;*/


        $scope.newWalletSelect = function () {
          if (Web3Service.coinbase) {
            $uibModal.open({
              templateUrl: 'partials/modals/selectNewWallet.html',
              size: 'sm',
              controller: function ($scope, $uibModalInstance) {
                if (Web3Service.coinbase) {
                  $scope.coinbase = Web3Service.coinbase;
                  $scope.walletOption = "create";
                }
                else {
                  $scope.walletOption = "restore";
                }


                $scope.ok = function () {
                  $uibModalInstance.close($scope.walletOption);
                };

                $scope.cancel = function () {
                  $uibModalInstance.dismiss();
                };
              }
            })
              .result
              .then(
                function (option) {
                  if (option == "create") {
                    // open create modal
                    $scope.newWallet();
                  }
                  else {
                    // open recover modal
                    $scope.restoreWallet();
                  }
                }
              );
          }
          else {
            // Show restore modal if no account setted
            $scope.restoreWallet();
          }
        };

        $scope.newWallet = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'partials/modals/newWallet.html',
            size: 'lg',
            controller: 'newWalletCtrl',
            resolve: {
              callback: function () {
                return function () {
                  $scope.updateParams();
                };
              }
            }
          });
        };


        $scope.removeWallet = function (address) {
          $uibModal.open({
            templateUrl: 'partials/modals/removeWallet.html',
            size: 'md',
            scope: $scope,
            controller: 'removeWalletCtrl',
            resolve: {
              wallet: function () {
                return $scope.wallets[address];
              },
              callback: function () {
                return $scope.updateParams;
              }
            }
          });
        };

        $scope.restoreWallet = function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'partials/modals/restoreWallet.html',
            size: 'md',
            scope: $scope,
            controller: function ($scope, $uibModalInstance) {
              $scope.ok = function () {
                $scope.old.address = Web3Service.toChecksumAddress($scope.old.address);
                Wallet.restore($scope.old, function (e) {
                  if (e) {
                    Utils.dangerAlert(e);
                  }
                  else {
                    // Add default tokens to wallet
                    Token.setDefaultTokens($scope.old.address);
                    // Load wallet's info immediately
                    $scope.updateParams();
                    // Close modal
                    $uibModalInstance.close();
                  }
                });
              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }
          });
        };

        $scope.editWallet = function (wallet) {
          $uibModal.open({
            templateUrl: 'partials/modals/editWallet.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return wallet;
              }
            },
            controller: function ($scope, $uibModalInstance, wallet) {
              $scope.name = wallet.name;
              $scope.address = wallet.address;

              $scope.ok = function () {
                Wallet.update(wallet.address, $scope.name);
                $uibModalInstance.close();
              };

              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }
          });
        };

        $scope.deposit = function (wallet) {
          $uibModal.open({
            templateUrl: 'partials/modals/deposit.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return wallet;
              }
            },
            controller: 'depositCtrl'
          });
        };

        $scope.setRequired = function (wallet) {
          $uibModal.open({
            templateUrl: 'partials/modals/updateRequired.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return wallet;
              }
            },
            controller: 'updateRequiredCtrl'
          });
        };

        $scope.setLimit = function (wallet) {
          $uibModal.open({
            templateUrl: 'partials/modals/setLimit.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return wallet;
              }
            },
            controller: 'setLimitCtrl'
          });
        };

        $scope.withdrawLimit = function (wallet) {
          $uibModal.open({
            templateUrl: 'partials/modals/withdrawLimit.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return wallet;
              }
            },
            controller: 'withdrawLimitCtrl'
          });
        };

        $scope.openNotifications = function (address) {
          var authCode = txDefault.alertNode.authCode || null;
          var template = 'partials/modals/notificationsSignup.html';
          var controller = 'notificationsSignupCtrl';

          if (authCode) {
            controller = 'addNotificationsCtrl';
            template = 'partials/modals/addNotifications.html';
          }

          $uibModal.open({
            templateUrl: template,
            size: 'md',
            resolve: {
              wallet: function () {
                return $scope.wallets[address];
              },
              callback: function () {
                return $scope.updateParams;
              }
            },
            controller: controller
          });
        };
      });
  }
)();
