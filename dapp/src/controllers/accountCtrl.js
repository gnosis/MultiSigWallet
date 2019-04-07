(
  function () {
    angular
    .module('multiSigWeb')
    .controller('accountCtrl', function ($scope, Config, $uibModal, Utils, Web3Service) {

      $scope.account = {};
      $scope.showLoadingSpinner = false;
      /**
      * Init function
      */
      function init (keystore=null, setAddresses=true) {

        if (keystore) {
          // Restore data
          Web3Service.restoreLightWallet();
        }

        if (setAddresses) {
          $scope.account.addresses = Config.getConfiguration('accounts');
        }

        $scope.keystore = !keystore ? Web3Service.getKeystore() : keystore;
        $scope.hasKeystore = $scope.keystore ? true : false;

        // If we're using lightwallet for 1st time,
        // show the lightwallet creation modal
        if (Config.getConfiguration('showCreateWalletModal')) {
          Config.removeConfiguration('showCreateWalletModal');
          $scope.createWallet();
        }
      }

      $scope.isObjectEmpty = function (obj){
        for(var key in obj) {
          if(obj.hasOwnProperty(key)) {
            return false;
          }
        }
        return true;
      };

      /**
      * Copy seed to clipboard generic success message
      */
      $scope.copySeedSuccessMessage = function () {
        Utils.success("Seed has been copied to clipboard.");
      };

      /**
      * Copy account to clipboard success message
      */
      $scope.copyAccount = function () {
        Utils.success("Account address has been copied to clipboard.");
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
            $scope.account.password = '';
            $scope.account.password_repeat = '';

            $scope.ok = function () {
              try{
                // Show loading spinner
                $scope.showLoadingSpinner = true;

                Web3Service.createLightWallet($scope.account.password, function (newAddress) {
                  var accounts = Config.getConfiguration('accounts');
                  var accountName = $scope.account.name;

                  if (accounts) {
                    accounts.push(
                      {
                        'name': accountName,
                        'address': newAddress
                      }
                    );
                  }
                  else {
                    accounts = [];
                    accounts.push(
                      {
                        'name': accountName,
                        'address': newAddress
                      }
                    );
                  }

                  // Unset password
                  delete $scope.account.password;

                  // Load updated accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  Config.setConfiguration('selectedAccount', JSON.stringify(newAddress));
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

              Web3Service.newLightWalletAccount($scope.account.password, function (addresses) {
                if (addresses) {
                  var accounts = Config.getConfiguration('accounts') || [];
                  var accountName = $scope.account.name;
                  // Look for other accounts with the same name
                  var sameAccountNames = accounts.filter(function (item) {
                    if (item.name.startsWith(accountName)) {
                      return item;
                    }
                  });

                  accounts.push(
                    {
                      'name': sameAccountNames.length > 0 ? accountName + sameAccountNames.length : accountName,
                      'address': addresses[addresses.length-1]
                    }
                  );
                  // Load updated accounts
                  Config.setConfiguration('accounts', JSON.stringify(accounts));
                  // Reload data
                  init(Web3Service.getKeystore(), true);
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
                  Utils.dangerAlert({message:'Invalid password.'});
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
      * Remove wallet/account
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

                  if (accounts.length==0) {
                    // remove keystore
                    Config.removeConfiguration('keystore');
                    Config.removeConfiguration('accounts');
                    Config.removeConfiguration('selectedAccount');
                    Web3Service.addresses = [];
                    // setting remotenoe by default
                    var userConfig = Config.getUserConfiguration();
                    userConfig.wallet = 'remotenode';
                    Config.setConfiguration("userConfig", JSON.stringify(userConfig));
                    // Reload configuration
                    loadConfiguration(); // config.js
                    Web3Service.reloadWeb3Provider();
                  }
                  else {
                    // Save accounts
                    Config.setConfiguration('accounts', JSON.stringify(accounts));

                    if ($scope.account.address == Config.getConfiguration('selectedAccount')) {
                      // Set the first account as selected
                      Config.setConfiguration('selectedAccount', accounts[0]);
                      Web3Service.selectAccount($scope.account.address);
                    }
                  }

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
      * Download keystore
      */
      $scope.downloadKeystore = function () {

        $uibModal.open({
          templateUrl: 'partials/modals/askLightWalletPassword.html',
          size: 'md',
          backdrop: 'static',
          windowClass: 'bootstrap-dialog type-info',
          controller: function ($scope, $uibModalInstance) {
            $scope.title = 'Unlock your account';
            $scope.password = '';

            $scope.ok = function () {
              try {
                var v3Instance = Web3Service.keystore.hdWallet.getWallet();
                var fileString = v3Instance.toV3String($scope.password);
                var filename = v3Instance.getV3Filename();
                var blob = new Blob([fileString], {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(blob, filename);
                $uibModalInstance.close();
              }
              catch (error) {
                Utils.dangerAlert({message:'Invalid password.'});
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };

          }
        });
      };

      $scope.openImportLightWallet = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/importLightWalletAccount.html',
          size: 'md',
          scope: $scope,
          controller: function ($scope, $uibModalInstance) {

            $scope.account.password = '';
            $scope.account.name = '';
            $scope.fileContent = null;
            $scope.fileValid = false;
            $scope.fileName = '';

            $scope.importAccount = function () {
              // Import light wallet account
              Web3Service.importLightWalletAccount($scope.fileContent, $scope.account.password, function (error, newAddress) {
                if (error) {
                  Utils.dangerAlert(error);
                  return;
                }
                
                var accounts = Config.getConfiguration('accounts');
                var accountName = $scope.account.name;

                if (accounts) {
                  accounts.push(
                    {
                      'name': accountName,
                      'address': newAddress
                    }
                  );
                }
                else {
                  accounts = [];
                  accounts.push(
                    {
                      'name': accountName,
                      'address': newAddress
                    }
                  );
                }

                // Unset password
                // delete $scope.account.password;

                // Load updated accounts
                Config.setConfiguration('accounts', JSON.stringify(accounts));
                Config.setConfiguration('selectedAccount', JSON.stringify(newAddress));
                // Reload data
                init();
                // Hide spinner
                $scope.showLoadingSpinner = false;
                // Show success modal
                Utils.success("Account was imported.");
                // Close modal
                $uibModalInstance.close();
              });
            }

            $scope.isFileValid = function(element) {
              var reader = new FileReader();

              reader.onload = function() {
                try {
                  $scope.fileContent = JSON.parse(reader.result);
                  $scope.fileValid = true;
                }
                catch (err) {
                  $scope.fileValid = false;
                }
              };

              var file = element.files[0];
              $scope.fileName = file.name;
              reader.readAsText(file);

            };

            $scope.uploadKeystore = function () {
              // Show loading spinner
              $scope.showLoadingSpinner = true;

              try {
                var address = $scope.fileContent.address;
                if (!address.startsWith('0x')) {
                  address = '0x' + address;
                }
                // check if address already imported or created
                if (Object.keys(JSON.parse(Web3Service.getKeystore() || '{}')).indexOf(address) == -1) {
                  $scope.importAccount();
                }
                else {
                  // Check if account is on the accounts array
                  var accounts = Config.getConfiguration('accounts');
                  var savedKey = false;
                  for (var key in Object.keys(accounts)){
                    if (accounts[key].address == address) {
                      savedKey = true;
                      break;
                    }
                  }
                  if (!savedKey){
                    $scope.importAccount();
                  }
                  else {
                    Utils.dangerAlert({message:'The account already exists.'});
                  }
                }
              }
              catch (err) {
                Utils.dangerAlert(err);
              }
              finally {
                $scope.showLoadingSpinner = false;
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
      * Retrieves the keystore seed
      */
      $scope.showSeed = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/showSeed.html',
          size: 'md',
          scope: $scope,
          controller: function ($scope, $uibModalInstance) {
            $scope.seed = Web3Service.keystore.mnemonic;

            $scope.copySeedSuccessMessage = function () {
              Utils.success("Seed has been copied to clipboard.");
              $uibModalInstance.close();
            };

            $scope.close = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
      * Exports a wallet address in a V3 format
      */
      $scope.exportV3 = function (address) {
        $uibModal.open({
          templateUrl: 'partials/modals/askLightWalletPassword.html',
          size: 'md',
          backdrop: 'static',
          windowClass: 'bootstrap-dialog type-info',
          controller: function ($scope, $uibModalInstance) {
            $scope.title = 'Export account';
            $scope.password = '';
            $scope.showLoadingSpinner = false;

            $scope.ok = function () {
              // show spinner
              $scope.showLoadingSpinner = true;

              Web3Service.decryptLightWallet(address, $scope.password, function (response, v3Instance) {
                if (!response) {
                  Utils.dangerAlert({message: "Invalid password."});
                  $scope.showLoadingSpinner = false;
                }
                else {
                  // Get V3 JSON format
                  var fileString = v3Instance.toV3String($scope.password);
                  var filename = v3Instance.getV3Filename();
                  var blob = new Blob([fileString], {type: "text/plain;charset=utf-8"});
                  // Download
                  FileSaver.saveAs(blob, filename);
                  // Hide spinner
                  $scope.showLoadingSpinner = false;
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

      /**
      * Call INIT
      */
      init();

    });
  }
)();
