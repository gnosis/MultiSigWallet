/**
* This controller manages submit new multisig transaction under daily limit
* using submitTransaction function.
*/
(
  function () {
    angular
    .module("multiSigWeb")
    .controller("withdrawLimitCtrl", function ($scope, Wallet, Transaction, Utils, wallet, $uibModalInstance) {

      $scope.wallet = wallet;
      $scope.tx = {
        value: 0,
        to: Wallet.coinbase,
        data: '0x0'
      };

      $scope.send = function () {
        $scope.tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');
        Wallet.submitTransaction(
          $scope.wallet.address,
          $scope.tx,
          null,
          null,
          null,
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.notification("Multisig transaction sent, will be mined in next 20s");
              Transaction.add(
                {
                  txHash: tx,
                  function () {
                    Utils.success("Multisig transaction mined");
                  }
                }
              );
              $uibModalInstance.close();
            }
          }
        )
      };

      $scope.signOff = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);
        Wallet.signTransaction(
          $scope.wallet.address,
          $scope.tx,
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
        )
      };

      $scope.getNonce = function () {
        $scope.tx.value = "0x" + new Web3().toBigNumber($scope.tx.value).mul('1e18').toString(16);

        Wallet.getNonce(wallet.address, $scope.tx.to, $scope.tx.value, "0x0", function (e, nonce) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            // Open new modal with nonce
            Utils.nonce(nonce);
            // Utils.success("Multisig Nonce: "+nonce);
          }
        }).call();

      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      }
    });
  }
)();
