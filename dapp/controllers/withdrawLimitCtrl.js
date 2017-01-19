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
        var tx = {};
        Object.assign(tx, $scope.tx);
        tx.value = new Web3().toBigNumber($scope.tx.value).mul('1e18');

        Wallet.submitTransaction(
          $scope.wallet.address,
          $scope.tx,
          null,
          null,
          null,
          function (e, tx) {
            if (e) {
              // Utils.dangerAlert(e);
              // Don't show anything, it could be a Tx Signature Rejected
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
          $scope.tx,
          null,
          null,
          null,
          function (e, tx) {
            if (e) {
              // Don't show anything, it could be a Tx Signature Rejected
              //Utils.dangerAlert(e);
            }
            else{
              $uibModalInstance.close();
              Utils.signed(tx);
            }
          }
        );
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
      };
    });
  }
)();
