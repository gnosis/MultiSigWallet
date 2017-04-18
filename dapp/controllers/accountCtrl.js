(
  function () {
    angular
    .module('multiSigWeb')
    .controller('accountCtrl', function ($window, $rootScope, $scope, LightWallet, Config, $uibModal, Utils, $location) {

      $scope.account = {};

      /**
      * Init function
      */
      function init (seed=null, keystore=null, setAddresses=true) {

        if (keystore) {
          // Restore data
          LightWallet.restore();
        }

        if (setAddresses) {
          //$scope.account.addresses = Object.assign([], LightWallet.addresses, Config.getConfiguration('accounts'));
          $scope.account.addresses = Config.getConfiguration('accounts');
        }

        $scope.keystore = !keystore ? LightWallet.getKeystore() : keystore;
        $scope.hasKeystore = $scope.keystore ? true : false;
        $scope.account.seed = seed;
        $scope.hasSeed = $scope.account.seed ? true : false;
      }

      /**
      * Provide password to unlock accounts
      */
      function login() {
        var accounts = Config.getConfiguration('accounts');
        if (LightWallet.getKeystore() && accounts && accounts.length > 0) {
          $uibModal.open({
            animation: false,
            templateUrl: 'partials/modals/lightWalletPassword.html',
            size: 'md',
            scope: $scope,
            backdrop: 'static',

            controller: function ($scope, $uibModalInstance) {

              $scope.ok = function () {
                // Restore
                LightWallet.decrypt($scope.account.password, function (canDecrypt) {
                  if (canDecrypt) {
                    // Reload params
                    init(null, LightWallet.getKeystore(), true);
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
        else if (LightWallet.getKeystore()) {
          init(null, LightWallet.getKeystore(), false);
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
        $scope.account.seed = lightwallet.keystore.generateRandomSeed();
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
          controller: function ($scope, $uibModalInstance, LightWallet) {
            $scope.showSetName = false;

            $scope.ok = function () {
              try{
                LightWallet.create($scope.account.password, $scope.account.seed, function (addresses) {
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
                  //init(null, null, false);
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

            $scope.newAccount = function () {
              LightWallet.newAccount($scope.account.password, function (address) {
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
                  init(null, LightWallet.getKeystore(), true);
                  // Unset password
                  delete $scope.account.password;
                  // Show success modal
                  Utils.success("Account was created.");
                  // Close modal
                  $uibModalInstance.close();
                }
                else {
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
              var isSeedValid = LightWallet.isSeedValid($scope.seed);
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
        var blob = new Blob([LightWallet.getKeystore()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "lightwallet.txt");
      };

      /**
      * Upload keystore
      */
      $scope.uploadKeystore = function (element) {
        var reader = new FileReader();

        reader.onload = function() {
          var text = reader.result;
          try {
            LightWallet.setKeystore(text);
            // Restore data from keystore
            LightWallet.restore();
            init();
          }
          catch (err) {

          }
        };

        var file = element.files[0];
        reader.readAsText(file);
      };

    });
  }
)();
