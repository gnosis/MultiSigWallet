(
  function () {
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function ($scope, Wallet, Utils, Transaction, $uibModal, $uibModalInstance, ABI, Web3Service) {
      $scope.methods = [];
      $scope.tx = {
        value: 0
      };
      $scope.params = [];

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

      $scope.send = function () {
        var tx = Wallet.txDefaults({
          gas: 21000
        });
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
        tx.from = Web3Service.coinbase;
        // if method, use contract instance method
        if ($scope.method && $scope.method.index !== undefined && $scope.method.index !== "") {
          Transaction.sendMethod(tx, $scope.abiArray, $scope.method.name, params, function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else if (tx.blockNumber) {
              Utils.success("Transaction was mined.");
            }
            else {
              $uibModalInstance.close();
              Utils.notification("Transaction was sent.");
              ABI.update($scope.abiArray, $scope.tx.to, $scope.name);
              Wallet.addMethods($scope.abiArray);
            }
          });
        }
        else {
          try {
            Transaction.send(tx, function (e, tx) {
              if (e) {
                Utils.dangerAlert(e);
              }
              else if (tx.blockNumber) {
                Utils.success("Transaction was mined.");
              }
              else {
                $uibModalInstance.close();
                Utils.notification("Transaction was sent.");

                if ($scope.name) {
                  if ($scope.abiArray) {
                    ABI.update($scope.abiArray, $scope.tx.to, $scope.name);
                  }
                  else {
                    ABI.update(undefined, $scope.tx.to, $scope.name);
                  }
                }
              }
            });
          } catch (error) {
            Utils.dangerAlert(error);
          }
        }
      };

      $scope.simulate = function () {
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
        tx.from = Web3Service.coinbase;
        tx.gas = 21000;
        
        // if method, use contract instance method
        if ($scope.method && $scope.method.index !== undefined && $scope.method.index !== "") {
          Transaction.simulateMethod(tx, $scope.abiArray, $scope.method.name, params, function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.simulatedTransaction(tx);
            }
          });
        }
        else {
          try {
            Transaction.simulate(tx, function (e, tx) {
              if (e) {
                Utils.dangerAlert(e);
              }
              else {
                Utils.simulatedTransaction(tx);
              }
            });
          } catch (error) {
            Utils.dangerAlert(error);
          }
        }
      };

      $scope.signOff = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);
        $scope.tx.from = Web3Service.coinbase;
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
        if ($scope.method) {
          Transaction.signMethodOffline($scope.tx, $scope.abiArray, $scope.method.name, params, function (e, tx) {
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
        else{
          Transaction.signOffline($scope.tx, function (e, tx) {
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
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
            if (item.name && item.type == "function") {
              $scope.methods.push({name: item.name, index: index, inputs: item.inputs, constant: item.constant});
            }
          });
        } catch (error) {
          $scope.methods = []; // reset methods
        }
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
