(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams){
      $scope.wallet = Wallet.wallets[$routeParams.address];
      // Get wallet balance, nonce, transactions, owners
      var batch = Wallet.web3.createBatch();
      $scope.owners = [];
      $scope.ownersNum = Object.keys($scope.wallet.owners).length;

      Wallet
      .loadJson()
      .then(
        function(){

          for(var i=0; i<$scope.ownersNum; i++){
            // Get owners
            batch.add(
              Wallet
              .getOwners(
                $routeParams.address,
                i,
                function(e, owner){
                  $scope.owners.push(owner);
                  $scope.$apply();
                }
              )
            );
          }

          // Get balance
          batch.add(
            Wallet
            .getBalance(
              $routeParams.address,
              function(e, balance){
                $scope.balance = balance.div('1e18').toNumber();
                $scope.$apply();
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
                $scope.$apply();
              }
            )
          )

          // Get nonces
          batch.add(
            Wallet
            .getRequired(
              $routeParams.address,
              function(e, required){
                $scope.required = required.toNumber();
                $scope.$apply();
              }
            )
          )

          batch.execute();
        }
      );      

      $scope.getOwnerName = function(address){
        return $scope.wallet.owners[address].name;
      }

      $scope.getOwners = function(){
        var batch = Wallet.web3.createBatch();
        $scope.owners = [];
        for(var i=0; i<$scope.ownersNum; i++){
          // Get owners
          batch.add(
            Wallet
            .getOwners(
              $routeParams.address,
              i,
              function(e, owner){
                if(owner){
                  $scope.owners.push(owner);
                  $scope.$apply();
                }
              }
            )
          );
        }

        batch.execute();
      }

    });
  }
)();
