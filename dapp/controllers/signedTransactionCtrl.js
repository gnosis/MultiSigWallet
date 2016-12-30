(
  function () {
    angular
    .module("multiSigWeb")
    .controller("signedTransactionCtrl", function ($scope, Wallet, Utils, Transaction, $uibModalInstance) {
      $scope.sendRawTransaction = function () {
        Transaction.sendRawTransaction($scope.tx, function (e, txHash) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.notification("Transaction was sent.");
            // Wait for transaction receipt to get contract address
            Transaction.add({txHash: txHash, callback: function () {
              Utils.success("Transaction was mined.");
            }});

          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      }
    });
  }
)();
