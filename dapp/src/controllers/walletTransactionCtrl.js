/**
* This controller manages submit new transactions with a wallet
* using submitTransaction function.
*/
(
  function () {
    angular
    .module("multiSigWeb")
    .controller("walletTransactionCtrl", function (Web3Service, $scope, Wallet, Transaction, Utils, wallet, $uibModal, $uibModalInstance, ABI) {

      $scope.wallet = wallet;
      $scope.abiArray = null;
      $scope.method = null;
      $scope.methods = [];
      $scope.params = [];
      $scope.tx = {
        value: 0
      };

      /**
       * Opens the address book modal
       */
      $scope.openAddressBook = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/selectAddressFromBook.html',
          size: 'lg',
          controller: function ($scope, $uibModalInstance) {
            // Load address book
            $scope.addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');
            // Sort addresses alphabetically
            $scope.addressArray = Object.keys($scope.addressBook).reduce(function (acc, value) {
              acc.push($scope.addressBook[value]);
              return acc;
            }, [])
            .sort(function (a, b) {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            });

            $scope.choose = function (item) {
              $uibModalInstance.close({
                item: item
              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(function (returnData) {
          // Set transaction's recipient
          if (returnData && returnData.item) {
            $scope.tx.to = returnData.item.address;
          }
          // ng-change="updateABI()" doesn't work here, so we need
          // to trigget it manually
          $scope.updateABI();
        });
      };

      $scope.updateABI = function () {
        var to = $scope.tx.to;
        if (to && to.length > 40) {
          to = Web3Service.toChecksumAddress(to);
          $scope.abis = ABI.get();
          if ($scope.abis[to]) {
            $scope.abi = JSON.stringify($scope.abis[to].abi);
            $scope.name = $scope.abis[to].name;
            $scope.updateMethods();
          }
        }
      };

      // Parse abi
      $scope.updateMethods = function () {
        try {
          $scope.methods = [{name: "Fallback function", index: ""}];
          $scope.method = $scope.methods[0];
          $scope.abiArray = JSON.parse($scope.abi);
          $scope.abiArray.map(function (item, index) {
            if (!item.constant && item.name && item.type == "function") {
              $scope.methods.push({name: item.name, index: index, inputs: item.inputs});
            }
          });
        } catch (error) {
          $scope.methods = []; // reset methods
        }
      };

      $scope.send = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        var params = [];
        Object.assign(params, $scope.params);
        if ($scope.method) {
          params.map(function(param, index) {
            // Parse if array param
            if ($scope.method.inputs && $scope.method.inputs.length && $scope.method.inputs[index].type.indexOf("[]") !== -1) {
              try {
                params[index] = JSON.parse($scope.params[index]);
              }
              catch (e) {
                Utils.dangerAlert(e);
              }
            }
          });
        }
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.submitTransaction(
          $scope.wallet.address,
          tx,
          $scope.abiArray,
          $scope.method && $scope.method.name?$scope.method.name:null,
          params,
          {onlySimulate: false},
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.notification("Multisig transaction was sent.");
              if ($scope.abiArray) {
                ABI.update($scope.abiArray, $scope.tx.to, $scope.name);
                Wallet.addMethods($scope.abiArray);
              }
              else if ($scope.name) {
                ABI.update(undefined, $scope.tx.to, $scope.name);
              }
              Transaction.add(
                {
                  txHash: tx,
                  callback: function () {
                    Utils.success("Multisig transaction was mined.");
                  }
                }
              );
              $uibModalInstance.close();
            }
          }
        );
      };

      $scope.simulate = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        var params = [];
        Object.assign(params, $scope.params);
        if ($scope.method) {
          params.map(function(param, index) {
            // Parse if array param
            if ($scope.method.inputs && $scope.method.inputs[index].type.indexOf("[]") !== -1) {
              try {
                params[index] = JSON.parse($scope.params[index]);
              }
              catch (e) {
                Utils.dangerAlert(e);
              }
            }
          });
        }
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.submitTransaction(
          $scope.wallet.address,
          tx,
          $scope.abiArray,
          $scope.method && $scope.method.index?$scope.method.name:null,
          params,
          {onlySimulate: true},
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.simulatedTransaction(tx);
            }
          }
        );
      };

      $scope.signOff = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        var params = [];
        Object.assign(params, $scope.params);
        if ($scope.method) {
          params.map(function(param, index) {
            // Parse if array param
            if ($scope.method.inputs && $scope.method.inputs[index].type.indexOf("[]") !== -1) {
              try {
                params[index] = JSON.parse($scope.params[index]);
              }
              catch (e) {
                Utils.dangerAlert(e);
              }
            }
          });
        }
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.signTransaction(
          $scope.wallet.address,
          tx,
          $scope.abiArray,
          $scope.method?$scope.method.name:null,
          params,
          function (e, signed) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              $uibModalInstance.close();
              Utils.signed(signed);
            }
          }
        );
      };

      $scope.getNonce = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);
        if ($scope.abiArray) {
          var instance = Web3Service.web3.eth.contract($scope.abiArray).at($scope.tx.to);
          $scope.data = instance[$scope.method.name].getData.apply(this, $scope.params);
        }
        else {
          $scope.data = "0x0";
        }

        Wallet.getNonce(wallet.address, $scope.tx.to, $scope.tx.value, $scope.data, function (e, nonce) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            // Open new modal with nonce
            Utils.nonce(nonce);
            // Utils.success("Multisig Nonce: "+nonce);
          }
        }).call();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
