(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addOwnerCtrl", function ($scope, Wallet, Utils, Transaction, wallet, $uibModalInstance) {
      $scope.send = function () {
        try{
          Wallet.addOwner(wallet.address, $scope.owner, function (e, tx) {
            if (e) {
              // Utils.dangerAlert(e);
              // Don't show anything, it could be a Tx Signature Rejected
            }
            else {
              // Update owners array
              wallet.owners[$scope.owner.address] = $scope.owner;
              Wallet.updateWallet(wallet);
              Utils.notification("Add owner transaction was sent.");
              Transaction.add({txHash: tx, callback: function () {
                Utils.success("Add owner transaction was mined. It might require more confirmations by other owners to add the new owner.");
              }});
              $uibModalInstance.close();
            }
          });
        } catch (error) {
          Utils.dangerAlert(error);
        }
      };

      $scope.sign = function () {
        Wallet.addOwnerOffline(wallet.address, $scope.owner, function (e, tx) {
          if (e) {
            // Don't show anything, it could be a Tx Signature Rejected
            //Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.signed(tx);
          }
        });
      };

      $scope.getNonce = function () {
        var data = Wallet.getAddOwnerData(wallet.address, $scope.owner);
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
