(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams){
      $scope.wallet = Wallet.wallets[$routeParams.address];

      // Get wallet balance, nonce, transactions, owners
      
    });
  }
)();
