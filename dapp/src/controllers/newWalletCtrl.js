(
  function () {
    angular
    .module("multiSigWeb")
    .controller("newWalletCtrl", function ($scope, $uibModalInstance, Utils, Transaction, Wallet, Token, callback, Web3Service) {

      $scope.newOwner = {};
      $scope.owners = {};
      $scope.owners[Web3Service.coinbase] = {
        name: 'My account',
        address: Web3Service.coinbase
      };

      $scope.confirmations = 1;
      $scope.limit = 0;
      $scope.maxAllowedConfirmations = 1;

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
                // Execute transaction
                Transaction.add({txHash: contract.transactionHash, callback: function (receipt) {
                  // Save wallet
                  Wallet.updateWallet({name: $scope.name, address: receipt.contractAddress, owners: $scope.owners});
                  Utils.success("Wallet deployed");
                  Transaction.update(contract.transactionHash, {multisig: receipt.contractAddress});
                  Token.setDefaultTokens(receipt.contractAddress);
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
                    var walletAddress = Web3Service.toChecksumAddress(receipt.decodedLogs[0].events[1].value);
                    Utils.success("Wallet deployed");
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
        // Checksum owner's address
        $scope.newOwner = Web3Service.toChecksumAddress($scope.newOwner);
        $scope.owners[$scope.newOwner.address] = $scope.newOwner;
        $scope.newOwner = {}; // reset values
        $scope.maxAllowedConfirmations = Object.keys($scope.owners).length
      };
    });
  }
)();
