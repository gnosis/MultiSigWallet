(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addressBookCtrl", function ($scope, $uibModal) {

      $scope.addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');

      $scope.showEmptyBook = function () {
        return Object.keys($scope.addressBook).length == 0;
      };

      /**
       *  Open a modal and adds an item to the address book
       */
      $scope.addAddress = function () {

        $uibModal.open({
          templateUrl: 'partials/modals/addAddressToBook.html',
          size: 'md',
          scope: $scope,
          resolve: {
            addressBook: $scope.addressBook
          },
          controller: function ($scope, $uibModalInstance, addressBook, Utils, Web3Service, Wallet) {
            $scope.book = {
              name: '',
              address: '',
              type: ''
            }

            var types = {
              multisig: 'Multisig',
              token: 'Token',
              eoa: 'EOA',
              contract: 'Contract'
            }

            /**
             * Adds and item to address book
             */
            $scope.addToBook = function (bookItem) {
              // Save new address into localstorage
              addressBook[bookItem.address] = bookItem;
              localStorage.setItem("addressBook", JSON.stringify(addressBook));
            };

            /**
             * Execute `addAddress` flow
             */
            $scope.ok = function () {
              // Check whether it is a contract, a token or a EOA
              var checksumAddress;
              try {
                checksumAddress = Web3Service.toChecksumAddress($scope.book.address);
              } catch (error) {
                Utils.dangerAlert(error);
              }

              if (!Web3Service.web3.isAddress($scope.book.address)) {
                // Show alert
                Utils.dangerAlert("Invalid Ethereum Address");
                return;
              }

              $scope.book.address = checksumAddress;

              // Get multisig instance from specified address
              var multisigInstance = Web3Service.web3.eth.contract(Wallet.json.multiSigDailyLimit.abi).at($scope.book.address);
              // Look for MAX_OWNER_COUNT property in Multisig contract,
              // it will be > 0 if the address corresponds to a real Multisig instance
              multisigInstance.MAX_OWNER_COUNT(function (e, count) {
                if (e) {
                  Utils.dangerAlert(e);
                  $uibModalInstance.close();
                } else if (count && count.gt(0)) {
                  // it is a multisig
                  $scope.book.type = types.multisig;
                  $scope.addToBook($scope.book);
                  $uibModalInstance.close();
                } else {
                  Web3Service.web3.eth.getCode($scope.book.address, function (e, code){
                    if (e) {
                      Utils.dangerAlert(e);
                      $uibModalInstance.close();
                    } else if (code.indexOf('18160ddd') !== -1) {
                      // 0x18160ddd -> sha3('totalSupply()').slice(0,10)
                      $scope.book.type = types.token;
                    } else if (code !== '0x') {
                      // it is a generic contract
                      $scope.book.type = types.contract;
                    } else {
                      // Mark it as a EOA
                      $scope.book.type = types.eoa;
                    }

                    $scope.addToBook($scope.book);
                    $uibModalInstance.close();

                  });
                }

              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            }
          }
        });
      };

      /**
       * Edits an address item
       */
      $scope.editAddress = function (item) {
        $uibModal.open({
          templateUrl: 'partials/modals/editAddressBookItem.html',
          size: 'md',
          resolve: {
            addressBook: $scope.addressBook
          },
          controller: function ($scope, $uibModalInstance, addressBook) {
            $scope.book = Object.assign({}, item);

            $scope.ok = function () {
              addressBook[item.address] = $scope.book;
              // Update localstorage
              localStorage.setItem("addressBook", JSON.stringify(addressBook));
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      /**
       * Removes an item from the Book
       */
      $scope.removeAddress = function (address) {
        $uibModal.open({
          templateUrl: 'partials/modals/removeAddressFromBook.html',
          size: 'md',
          resolve: {
            addressBook: $scope.addressBook
          },
          controller: function ($scope, $uibModalInstance, addressBook) {
            $scope.book = addressBook[address];

            $scope.ok = function () {
              delete addressBook[address];
              // Update localstorage
              localStorage.setItem("addressBook", JSON.stringify(addressBook));
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

    });
  }
)();
