(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams, Utils, Transaction, Owner, $interval){
      $scope.wallet = Wallet.wallets[$routeParams.address];
      // Get wallet balance, nonce, transactions, owners
      var batch = Wallet.web3.createBatch();
      $scope.owners = [];
      $scope.transactions = {};

      $scope.updateParams = function(){        

        // Get owners
        batch.add(
          Wallet
          .getOwners(
            $routeParams.address,
            function(e, owners){
              $scope.owners = owners;
              $scope.$apply();
            }
          )
        );


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
                // Get transaction details
                pendingBatch.add(
                  Wallet.getTransaction($scope.wallet.address, txHash, function(e, tx){
                    if(!$scope.transactions[txHash]){
                      $scope.transactions[txHash] = {};
                    }
                    Object.assign($scope.transactions[txHash], tx);
                    $scope.$apply();
                  })
                )

                // Get isConfirmed by user
                pendingBatch.add(
                  Wallet.isConfirmed($scope.wallet.address, txHash, function(e, confirmed){
                    if(!$scope.transactions[txHash]){
                      $scope.transactions[txHash] = {};
                    }
                    Object.assign($scope.transactions[txHash], {isConfirmed: confirmed});
                    $scope.$apply();
                  })
                );

              });
              pendingBatch.execute();
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
                    if(!$scope.transactions[txHash]){
                      $scope.transactions[txHash] = {};
                    }
                    Object.assign($scope.transactions[txHash], tx);
                    $scope.$apply();
                  })
                );
              });

              executedBatch.execute();
            }
          )
        )

        batch.execute();
      }

      Wallet.initParams().then(function(){
        $scope.updateParams();
        $scope.interval = $interval($scope.updateParams, 15000);
      });

      $scope.$on('destroy', function(){
        $interval.cancel($scope.interval);
      })

      $scope.getOwnerName = function(address){
        if(Owner.owners && Owner.owners[address]){
          return Owner.owners[address].name;
        }
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
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            // Update owners array
          }
        });
      }

      $scope.confirmTransaction = function(txHash){
        Wallet.confirmTransaction($scope.wallet.address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Confirmation sent, will be mined in next 20s");
            Transaction.add({txHash: tx});
          }
        });
      }

      $scope.confirmTransactionOffline = function(txHash){
        Wallet.confirmTransactionOffline($scope.wallet.address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.success('<div class="form-group"><label>Transaction:'+
            '</label> <textarea class="form-control" rows="5">'+ tx + '</textarea></div>');
          }
        });
      }

      $scope.revokeConfirmation = function(txHash){
        Wallet.revokeConfirmation($scope.wallet.address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Revoke confirmation sent, will be mined in next 20s");
            Transaction.add({txHash: tx});
          }
        });
      }

      $scope.revokeConfirmationOffline = function(txHash){
        Wallet.revokeConfirmationOffline($scope.wallet.address, txHash, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.success('<div class="form-group"><label>Transaction:'+
            '</label> <textarea class="form-control" rows="5">'+ tx + '</textarea></div>');
          }
        });
      }

      $scope.removeOwner = function(owner){
        Wallet.removeOwner($scope.wallet.address, {address: owner}, function(e, tx){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            Utils.notification("Remove owner transaction sent, will be mined in next 20s");
            Transaction.add({txHash: tx});
          }
        });
      }

    });
  }
)();
