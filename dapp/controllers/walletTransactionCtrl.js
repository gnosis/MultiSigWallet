/**
* This controller manages submit new transactions with a wallet
* using submitTransaction function.
*/
(
  function () {
    angular
    .module("multiSigWeb")
    .controller("walletTransactionCtrl", function ($scope, Wallet, Transaction, Utils, wallet, $uibModalInstance, ABI) {

      $scope.wallet = wallet;
      $scope.abiArray = null;
      $scope.method = null;
      $scope.methods = [];
      $scope.params = [];
      $scope.tx = {
        value: 0
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

      // Parse abi
      $scope.updateMethods = function () {
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function (item, index) {
          if (!item.constant && item.name && item.type == "function") {
            $scope.methods.push({name: item.name, index: index});
          }
        });
      };

      $scope.send = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.submitTransaction(
          $scope.wallet.address,
          tx,
          $scope.abiArray,
          $scope.method?$scope.method.name:null,
          $scope.params,
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.notification("Multisig transaction was sent.");
              ABI.update($scope.abiArray, $scope.tx.to);
              Wallet.addMethods($scope.abiArray);
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

      $scope.signOff = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.signTransaction(
          $scope.wallet.address,
          tx,
          $scope.abiArray,
          $scope.method?$scope.method.name:null,
          $scope.params,
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
          var instance = Wallet.web3.eth.contract($scope.abiArray).at($scope.tx.to);
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
