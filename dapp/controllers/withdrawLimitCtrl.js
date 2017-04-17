/**
* This controller manages submit new multisig transaction under daily limit
* using submitTransaction function.
*/
(
  function () {
    angular
    .module("multiSigWeb")
    .controller("withdrawLimitCtrl", function ($scope, Wallet, Transaction, Utils, wallet, $uibModalInstance, Web3Service) {

      $scope.wallet = wallet;
      $scope.tx = {
        value: 0,
        to: Web3Service.coinbase,
        data: '0x0'
      };

      $scope.send = function () {
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');

        Wallet.submitTransaction(
          $scope.wallet.address,
          tx,
          null,
          null,
          null,
          {onlySimulate: false},
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.notification("Multisig transaction was sent.");
              Transaction.add(
                {
                  txHash: tx,
                  callback: function () {
                    Utils.success("Multisig transaction was mined");
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
          null,
          null,
          null,
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else{
              $uibModalInstance.close();
              Utils.signed(tx);
            }
          }
        );
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
