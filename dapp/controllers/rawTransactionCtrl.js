(
  function(){
    angular
    .module("multiSigWeb")
    .controller("rawTransactionCtrl", function($scope, Wallet, Utils, Transaction){
      $scope.sendRawTransaction = function(){
        Wallet.web3.eth.sendRawTransaction($scope.tx, function(e, txHash){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.success("Transaction sent: <a target='_blank' href='https://testnet.etherscan.io/tx/"+txHash+"'>"+txHash+"</a>");

            // Wait for transaction receipt to get contract address
            Wallet.web3.eth.getTransactionReceipt(txHash, function(e, receipt){
              console.log(e, receipt);
              Transaction.add({txHash: receipt.transactionHash, receipt: receipt})
            });
          }
        });
      }
    });
  }
)();
