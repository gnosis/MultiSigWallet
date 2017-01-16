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
            Transaction.add({txHash: txHash, callback: function (receipt) {

              if (receipt.contractAddress){
                Wallet.web3.eth.getCode(receipt.contractAddress, function (e, code){
                  if (code.length > 100 && Wallet.json.multiSigDailyLimit.binHex.slice(-992) == code.slice(-992)){
                    Utils.success("Multisig wallet deployed at "+ receipt.contractAddress);
                    Wallet.updateWallet({name: "Offline wallet", address: receipt.contractAddress, owners: {}});
                  }
                  else {
                    Utils.success("Contract deployed at "+ receipt.contractAddress);
                  }
                });
              }
              else {
                Utils.success("Transaction was mined.");
              }
            }});

          }
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
