(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams, Utils){
      $scope.wallet = Wallet.wallets[$routeParams.address];
      // Get wallet balance, nonce, transactions, owners
      var batch = Wallet.web3.createBatch();
      $scope.owners = [];
      $scope.ownersNum = Object.keys($scope.wallet.owners).length;
      $scope.transactions = {};

      $scope.updateParams = function(){
        Wallet
        .loadJson()
        .then(
          function(){
            var owners = [];
            for(var i=0; i<$scope.ownersNum; i++){
              // Get owners
              batch.add(
                Wallet
                .getOwners(
                  $routeParams.address,
                  i,
                  function(e, owner){
                    owners.push(owner);
                    $scope.owners = owners;
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

            // Get pending transactions
            batch.add(
              Wallet
              .getPendingTransactions(
                $scope.wallet.address,
                function(e, pending){
                  $scope.pending = pending;

                  // Get transaction info
                  var pendingBatch = Wallet.web3.createBatch();
                  pending.map(function(txHash){
                    pendingBatch.add(
                      Wallet.getTransaction($scope.wallet.address, txHash, function(e, tx){
                        $scope.transactions[txHash] = tx;
                      })
                    )
                  });
                }
              )
            )

            // Get executed transactions
            batch.add(
              Wallet
              .getExecutedTransactions(
                $scope.wallet.address,
                function(e, executed){
                  $scope.executed = executed;

                  // Get transaction info
                  var executedBatch = Wallet.web3.createBatch();
                  executed.map(function(txHash){
                    executedBatch.add(
                      Wallet.getTransaction($scope.wallet.address, txHash, function(e, tx){
                        $scope.transactions[txHash] = tx;
                      })
                    )
                  });

                  executedBatch.execute();
                }
              )
            )

            batch.execute();
            setTimeout($scope.updateParams, 15000);
          }
        );
      }

      $scope.updateParams();

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

      $scope.addOwner = function(){
        Wallet.addOwner($scope.wallet.address, $scope.newOwner, function(e){
          console.log(e);
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            // Update owners array
          }
        });
      }

    });
  }
)();
