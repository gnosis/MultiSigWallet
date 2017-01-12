(
  function () {
    angular
    .module("multiSigWeb")
    .controller("newFactoryWalletCtrl", function ($scope, $uibModalInstance, $uibModal, Utils, Transaction, Wallet, callback) {

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
        Wallet.deployWithLimitFactory(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
          function (e, tx) {
            Transaction.add(
              {
                txHash: tx,
                callback: function(receipt){
                  console.log(receipt);
                }
              }
            );
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
          animation: false,
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
