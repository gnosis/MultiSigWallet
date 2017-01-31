(
  function () {
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function ($scope, Wallet, Utils, Transaction, $uibModalInstance, ABI) {
      $scope.methods = [];
      $scope.tx = {
        value: 0,
        from: Wallet.coinbase
      };
      $scope.params = [];

      $scope.send = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        // if method, use contract instance method
        if ($scope.method) {
          Transaction.sendMethod(tx, $scope.abiArray, $scope.method.name, $scope.params, function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else if (tx.info && tx.info.blockNumber) {
              Utils.success("Transaction was mined.");
            }
            else {
              $uibModalInstance.close();
              Utils.notification("Transaction was sent.");
              ABI.update($scope.abiArray, $scope.tx.to);
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
              }
            });
          } catch (error) {
            Utils.dangerAlert(error);
          }
        }
      };

      $scope.signOff = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);
        if ($scope.method) {
          Transaction.signMethodOffline($scope.tx, $scope.abiArray, $scope.method.name, $scope.params, function (e, tx) {
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

      $scope.updateABI = function () {
        if ($scope.tx.to && $scope.tx.to.length > 40) {
          $scope.abis = ABI.get();
          if ($scope.abis[$scope.tx.to]) {
            $scope.abi = JSON.stringify($scope.abis[$scope.tx.to]);
            $scope.updateMethods();
          }
        }
      };

      $scope.updateMethods = function () {
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function (item, index) {
          if (!item.constant && item.name && item.type == "function") {
            $scope.methods.push({name: item.name, index: index});
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
