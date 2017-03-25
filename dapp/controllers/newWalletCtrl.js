(
  function () {
    angular
    .module("multiSigWeb")
    .controller("newWalletCtrl", function ($scope, $uibModalInstance, $uibModal, Utils, Transaction, Wallet, callback) {

      $scope.newOwner = {};
      $scope.owners = {};
      $scope.owners[Wallet.coinbase] = {
        name: 'My account',
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
              if (!contract.address) {
                $uibModalInstance.close();
                Transaction.add({txHash: contract.transactionHash, callback: function (receipt) {
                  // Save wallet
                  Wallet.updateWallet({name: $scope.name, address: receipt.contractAddress, owners: $scope.owners});
                  Utils.success("Wallet deployed at address: " + receipt.contractAddress);
                  Transaction.update(contract.transactionHash, {multisig: receipt.contractAddress});
                  callback();
                }});
                Utils.notification("Deployment transaction was sent.");
              }
            }
          }
        );
      };

      $scope.deployOfflineWallet = function () {
        Wallet.deployWithLimitOffline(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
        function (e, signed) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            $uibModalInstance.close();
            Utils.signed(signed);
          }
        });
      };

      $scope.deployFactoryWallet = function () {
        Wallet.deployWithLimitFactory(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              $uibModalInstance.close();
              Utils.notification("Deployment transaction was sent to factory contract.");
              Transaction.add(
                {
                  txHash: tx,
                  callback: function(receipt){
                    var walletAddress = receipt.decodedLogs[0].events[1].value;
                    Utils.success("Wallet deployed at address: " + walletAddress);
                    Wallet.updateWallet({name: $scope.name, address: walletAddress, owners: $scope.owners});
                    Transaction.update(tx, {multisig: walletAddress});
                    callback();
                  }
                }
              );
            }
          }
        );
      };

      $scope.deployFactoryWalletOffline = function () {
        Wallet.deployWithLimitFactoryOffline(Object.keys($scope.owners), $scope.confirmations, new Web3().toBigNumber($scope.limit).mul('1e18'),
          function (e, signed) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              $uibModalInstance.close();
              Utils.signed(signed);
            }
          }
        );
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.addOwner = function () {
          $scope.owners[$scope.newOwner.address] = $scope.newOwner;
          $scope.newOwner = {}; // reset values
      };

      /*$scope.addOwner = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/addOwner.html',
          size: 'md',
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
      };*/
    });
  }
)();
