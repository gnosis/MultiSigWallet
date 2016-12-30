(
  function () {
    angular
    .module("multiSigWeb")
    .controller("removeOwnerCtrl", function ($scope, Wallet, Utils, Transaction, wallet, owner, $uibModalInstance) {
      $scope.owner = owner;
      $scope.send = function () {
        Wallet.removeOwner(wallet.address, $scope.owner, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            // Update owners array
            Wallet.updateWallet(wallet);
            Utils.notification("Remove owner transaction was sent.");
            Transaction.add({txHash: tx, callback: function (){
              Utils.success("Remove owner transaction was mined. It might require more confirmations by other owners to remove the owner.");
            }});
            $uibModalInstance.close();
          }
        });
      };

      $scope.sign = function () {
        Wallet.removeOwnerOffline(wallet.address, $scope.owner, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.signed(tx);
          }
        });
      };

      $scope.getNonce = function () {
        var data = Wallet.getRemoveOwnerData(wallet.address, $scope.owner);
        Wallet.getNonce(wallet.address, wallet.address, "0x0", data, function (e, nonce) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            // Open modal
            $uibModalInstance.close();
            Utils.nonce(nonce);
          }
        }).call();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
