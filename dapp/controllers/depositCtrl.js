(
  function(){
    angular
    .module("multiSigWeb")
    .controller("depositCtrl", function($scope, Transaction, $routeParams, $location, Wallet, Utils){
      $scope.wallet = Wallet.wallets[$routeParams.address];
      $scope.amount = 10;
      $scope.deposit = function(){
        Transaction.send(
          {
            to: $scope.wallet.address,
            value: $scope.amount*1000000000000000000,
            nonce: Wallet.txParams.nonce
          },
          function(e, tx){
            if(tx.blockNumber){
              Utils.success("Ether is now on your wallet");
            }
            else{
              Utils.notification("Transaction sent, will be mined in next 20s");
              $location.path("/wallet/"+$scope.wallet.address);
            }
          }
        )
      }
    });
  }
)();
