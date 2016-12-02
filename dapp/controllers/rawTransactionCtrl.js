(
  function(){
    angular
    .module("multiSigWeb")
    .controller("rawTransactionCtrl", function($scope, Wallet, Utils, Transaction){
      $scope.sendRawTransaction = function(){
        Transaction.sendRawTransaction($scope.tx, function(e, txHash){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Transaction sent: <a target='_blank' href='https://testnet.etherscan.io/tx/"+txHash+"'>"+txHash+"</a>");

            // Wait for transaction receipt to get contract address
            Transaction.add({txHash: txHash, callback: function(){
              Utils.success("Transaction mined");
            }});

          }
        });
      }
    });
  }
)();
