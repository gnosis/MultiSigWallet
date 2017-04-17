(
  function () {
    angular
    .module("multiSigWeb")
    .controller("signedTransactionCtrl", function (Web3Service, $scope, Wallet, Utils, Transaction, $uibModalInstance) {
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

              if (receipt.contractAddress) {
                Web3Service.web3.eth.getCode(receipt.contractAddress, function (e, code){
                  if (code.length > 100 && Wallet.json.multiSigDailyLimit.binHex.slice(-992) == code.slice(-992)){
                    Utils.success("Wallet deployed at address: " + receipt.contractAddress);
                    Wallet.updateWallet({name: "Offline wallet", address: receipt.contractAddress, owners: {}});
                    Transaction.update(txHash, {multisig: receipt.contractAddress});
                  }
                  else {
                    Utils.success("Contract deployed at address: " + receipt.contractAddress);
                  }
                });
              }
              else if( receipt.decodedLogs.length && receipt.decodedLogs[0] && receipt.decodedLogs[0].events && receipt.decodedLogs[0].events.length > 1 && receipt.decodedLogs[0].events[1].name == "instantiation"){
                var walletAddress = receipt.decodedLogs[0].events[1].value;
                Utils.success("Wallet deployed at address:" + walletAddress);
                Wallet.updateWallet({name: "Factory wallet", address: walletAddress, owners: {}});
                Transaction.update(txHash, {multisig: walletAddress});
              }
              else {
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
