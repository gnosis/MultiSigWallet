(
  function () {
    angular
    .module("multiSigWeb")
    .controller("executeTransactionCtrl", function ($scope, txId, address, Wallet, Transaction, $uibModalInstance, Utils){
      $scope.send = function () {
        Wallet.executeTransaction(address, txId, {onlySimulate: false}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.notification("Execution transaction was sent.");
            Transaction.add({txHash: tx, callback: function (){
              Utils.success("Execution transaction was mined.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.simulate = function () {
        Wallet.executeTransaction(address, txId, {onlySimulate: true}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.simulatedTransaction(tx);
          }
        });
      };

      $scope.sign = function () {
        Wallet.executeTransactionOffline(address, txId, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.signed(tx);
            $uibModalInstance.close();
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
