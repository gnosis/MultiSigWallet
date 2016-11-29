(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams){
      $scope.wallet = Wallet.wallets[$routeParams.address];

      // Get wallet balance, nonce, transactions, owners
      var batch = Wallet.web3.createBatch();

      Wallet
      .loadJson()
      .then(
        function(){

          // Get owners
          batch.add(
            Wallet
            .getOwners(
              $routeParams.address,
              function(e, owners){
                $scope.owners = owners;
              }
            )
          );

          // Get balance
          batch.add(
            Wallet
            .getBalance(
              $routeParams.address,
              function(e, balance){
                $scope.balance = balance;
              }
            )
          )

          // Get nonces
          batch.add(
            Wallet
            .getNonces(
              $routeParams.address,
              function(e, nonces){
                $scope.nonces = nonces;
              }
            )
          )

          batch.execute();
        }
      );

    });
  }
)();
