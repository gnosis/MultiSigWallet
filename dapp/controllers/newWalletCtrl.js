(
  function () {
    angular
    .module("multiSigWeb")
    .controller("newWalletCtrl", function ($scope, $uibModalInstance, $uibModal, Utils, Transaction, Wallet) {

      $scope.owners = {};
      $scope.owners[Wallet.coinbase] = {
        name: 'My Account',
        address: Wallet.coinbase
      };

      $scope.confirmations = 1;
      $scope.limit = 0;

      $scope.removeOwner = function (address) {
        delete $scope.owners[address];
      };

      $scope.deployWallet = function () {
        Wallet.deployWithLimit(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
          function (e, contract) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              if (contract.address) {
                // Save wallet
                Wallet.updateWallet({name: $scope.name, address: contract.address, owners: $scope.owners});
                Utils.success("Wallet deployed at address " + contract.address);
              }
              else {
                $uibModalInstance.close();
                Transaction.add({txHash: contract.transactionHash});
                Utils.notification("Deployment transaction was sent.");
              }
            }
          }
        );
      };

      $scope.deployOfflineWallet = function () {
        Wallet.deployWithLimitOffline(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
        function (e, tx) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.success('<div class="form-group"><label>Multisignature wallet '+
            'deployed offline:</label> <textarea class="form-control" rows="5">'+ tx + '</textarea></div>');
          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.addOwner = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/addOwner.html',
          size: 'sm',
          controller: function ($scope, $uibModalInstance) {
            $scope.owner = {
              name: "",
              address: ""
            };

            $scope.ok = function () {
              $uibModalInstance.close($scope.owner);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function (owner) {
            $scope.owners[owner.address] = owner;
          }
        );
      };
    });
  }
)();
