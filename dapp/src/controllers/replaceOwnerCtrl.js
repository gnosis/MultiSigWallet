(
  function () {
    angular
    .module("multiSigWeb")
    .controller("replaceOwnerCtrl", function ($scope, Web3Service, Wallet, Utils, Transaction, wallet, owner, $uibModalInstance) {
      $scope.owner = owner;
      $scope.send = function () {
        // Convert owner address to checksum address
        $scope.newOwner = Web3Service.toChecksumAddress($scope.newOwner);
        
        Wallet.replaceOwner(wallet.address, $scope.owner.address, $scope.newOwner, {onlySimulate: false}, function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            wallet.owners[$scope.newOwner] = {
              name: wallet.owners[$scope.owner.address].name,
              address: $scope.newOwner
            };
            delete wallet.owners[$scope.owner.address];

            // Update owners array
            Wallet.updateWallet(wallet);
            Utils.notification("Replace owner transaction was sent.");
            Transaction.add({txHash: tx, callback: function (){
              Utils.success("Replace owner transaction was mined.");
            }});
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
