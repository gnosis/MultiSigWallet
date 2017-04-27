(
  function () {
    angular
    .module('multiSigWeb')
    .controller('accountCtrl', function ($window, $rootScope, $scope, Config, $uibModal, Utils, $location, Web3Service) {

      $scope.account = {};
      $scope.showLoadingSpinner = false;
      /**
      * Init function
      */
      function init (seed=null, keystore=null, setAddresses=true) {

        if (keystore) {
          // Restore data
          Web3Service.restore();
        }

        if (setAddresses) {
          //$scope.account.addresses = Object.assign([], Web3Service.addresses, Config.getConfiguration('accounts'));
          $scope.account.addresses = Config.getConfiguration('accounts');
        }

        $scope.keystore = !keystore ? Web3Service.getKeystore() : keystore;
        $scope.hasKeystore = $scope.keystore ? true : false;
        $scope.account.seed = seed;
        $scope.hasSeed = $scope.account.seed ? true : false;
      }

      /**
      * Provide password to unlock accounts
      */
      function login() {
        var accounts = Config.getConfiguration('accounts');
        if (Web3Service.getKeystore() && accounts && accounts.length > 0) {
          $uibModal.open({
            animation: false,
            templateUrl: 'partials/modals/lightWalletPassword.html',
            size: 'md',
            scope: $scope,
            backdrop: 'static',

            controller: function ($scope, $uibModalInstance) {

              $scope.ok = function () {
                // Restore
                Web3Service.decrypt($scope.account.password, function (canDecrypt) {
                  if (canDecrypt) {
                    // Reload params
                    init(null, Web3Service.getKeystore(), true);
                    // Unset password
                    delete $scope.account.password;
                    // Close modal
                    $uibModalInstance.close();
                  }
                  else {
                    Utils.dangerAlert({message:'Invalid password.'})
                  }
                });
              };

              $scope.cancel = function () {
                if (isElectron) {
                  $location.path('wallets');
                }
                else {
                  $window.location.href = '/';
                }
              };
            }
          })
        }
        else if (Web3Service.getKeystore()) {
          init(null, Web3Service.getKeystore(), false);
        }
      }

      /**
      * Execute login on page load. The user is asked to type a password
      * in order to decrypt accounts
      */
      login();

      /**
      * Create seed
      */
      $scope.createSeed = function () {
        $scope.account.seed = Web3Service.generateLightWalletSeed();
        $scope.hasSeed = true;
      };

      /**
      * Copy seed to clipboard
      */
      $scope.copySeed = function () {
        Utils.success("Seed has been copied to clipboard.");
      };

      /**
      * Account/wallet creation
      */
      $scope.createWallet = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/addLightWalletAccount.html',
          size: 'md',
          scope: $scope,
          controller: function ($scope, $uibModalInstance, Web3Service) {
            $scope.showSetName = false;
            $scope.account.name = '';

            $scope.ok = function () {
              try{
                // Show loading spinner
                $scope.showLoadingSpinner = true;

                Web3Service.createLightWallet($scope.account.password, $scope.account.seed, function (addresses) {
                  var accounts = Config.getConfiguration('accounts');
                  if (accounts) {
                    accounts.push(
                      {
                        'name': $scope.account.name,
                        'address': address
                      }
                    );
                  }
                  else {
                    accounts = [];
                    accounts.push(
                      {
                        'name': $scope.account.name,
                        'address': addresses[0]
                      }
                    );
                  }

                  // Unset password
                  delete $scope.account.password;

                  // Load updated accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  // Reload data
                  init();
                  // Hide spinner
                  $scope.showLoadingSpinner = false;
                  // Show success modal
                  Utils.success("Account was created.");
                  // Close modal
                  $uibModalInstance.close();
                });
              }
              catch (err) {
                Utils.dangerAlert(err);
              }
            };

            /**
            * Function enabled once keystore is created
            */
            $scope.newAccount = function () {
              // show spinner
              $scope.showLoadingSpinner = true;

              Web3Service.newAccount($scope.account.password, function (address) {
                if (address) {
                  var accounts = Config.getConfiguration('accounts') || [];
                  accounts.push(
                    {
                      'name': $scope.account.name,
                      'address': address
                    }
                  );
                  // Load updated accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  // Reload data
                  init(null, Web3Service.getKeystore(), true);
                  // Unset password
                  delete $scope.account.password;
                  // hide spinner
                  $scope.showLoadingSpinner = false;
                  // Show success modal
                  Utils.success("Account was created.");
                  // Close modal
                  $uibModalInstance.close();
                }
                else {
                  // hide spinner
                  $scope.showLoadingSpinner = false;
                  delete $scope.account.password;
                  Utils.dangerAlert({message:'Invalid passwod.'})
                }
              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
      * Edit wallet/account
      */
      $scope.editAccount = function (account) {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/editLightWalletAccount.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance, Config) {
            $scope.account = account;
            $scope.account.new_name = account.name; // avoid editing name

            $scope.ok = function () {
              // get accounts
              var accounts = Config.getConfiguration('accounts');
              for (var x in accounts) {
                if (accounts[x].address == $scope.account.address && $scope.account.new_name.length > 0) {
                  // Set new account name
                  accounts[x].name = $scope.account.new_name;
                  // Save accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  // Show success modal
                  Utils.success("Account was updated.");
                  // Reload data
                  init();
                  // Close modal
                  $uibModalInstance.close();
                  break;
                }
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
      * Create wallet/account
      */
      $scope.removeAccount = function (account) {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/removeLightWalletAccount.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance, Config) {
            $scope.account = account;

            $scope.ok = function () {
              // get accounts
              var accounts = Config.getConfiguration('accounts');
              for (var x in accounts) {
                if (accounts[x].address == $scope.account.address) {
                  // Set new account name
                  accounts.splice(x, 1);
                  // Save accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  // Reload data
                  init();
                  // Show success modal
                  Utils.success("Account was removed.");
                  // Close modal
                  $uibModalInstance.close();
                  break;
                }
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
      * Restore account from seed
      */
      $scope.restoreFromSeed = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/restoreSeed.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance) {

            $scope.ok = function () {
              // Restore
              var isSeedValid = Web3Service.isSeedValid($scope.seed);
              if (isSeedValid) {
                $uibModalInstance.close($scope.seed);
              }
              else {
                Utils.dangerAlert({message:'Invalid seed phrase.'})
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function (seed) {
            init(seed);
          }
        );

      };

      /**
      * Download keystore
      */
      $scope.downloadKeystore = function () {
        var blob = new Blob([Web3Service.getKeystore()], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "lightwallet.txt");
      };

      /**
      * Upload keystore
      */
      $scope.uploadKeystore = function (element) {
        var reader = new FileReader();

        reader.onload = function() {
          var text = reader.result;
          var accounts = [];
          try {
            Web3Service.setKeystore(text);
            // Restore data from keystore
            Web3Service.restore();
            Web3Service.getAddresses().map(function (address) {
              accounts.push(
                {
                  'name': '',
                  'address': address
                }
              );
            });

            // Load updated accounts
            Config.setConfiguration('accounts', JSON.stringify(accounts));
            // Redo setup
            Web3Service.lightWalletSetup();
            // Init values
            init();

            Utils.success("Accounts were imported successfully.");
          }
          catch (err) {
            Utils.dangerAlert(err);
          }
        };

        var file = element.files[0];
        reader.readAsText(file);
      };

    });
  }
)();
