(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function($scope, Wallet, $routeParams, Utils, Transaction, $interval, $uibModal){
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

      Wallet.initParams().then(function(){
        $scope.updateParams();
        $scope.interval = $interval($scope.updateParams, 15000);
      });

      $scope.$on('$destroy', function(){
        $interval.cancel($scope.interval);
      })

      $scope.getOwnerName = function(address){
        if($scope.wallet.owners && $scope.wallet.owners[address]){
          return $scope.wallet.owners[address].name;
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
        $uibModal.open({
          templateUrl: 'partials/modals/addOwner.html',
          size: 'sm',
          controller: function($scope, $uibModalInstance) {
            $scope.owner = {
              name: "",
              address: ""
            };

            $scope.ok = function () {
              $uibModalInstance.close($scope.owner);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function(owner){
            Wallet.addOwner($scope.wallet.address, owner, function(e){
              if(e){
                Utils.dangerAlert(e);
              }
              else{
                console.log(owner);
                $scope.wallet.owners[owner.address] = owner;
                // Update owners array
                Wallet.updateWallet($scope.wallet);
                $scope.updateParams();
              }
            });
          }
        )
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

      $scope.editOwner = function(owner){
        $uibModal.open({
          templateUrl: 'partials/modals/editOwner.html',
          size: 'sm',
          resolve: {
            owner: function(){
              return $scope.wallet.owners[owner];
            }
          },
          controller: function($scope, $uibModalInstance, owner) {
            $scope.owner = {
              address: owner.address,
              name: owner.name
            }

            $scope.ok = function () {
              $uibModalInstance.close($scope.owner);
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(function(owner){
          $scope.wallet.owners[owner.address] = owner;
          Wallet.updateWallet($scope.wallet);
        });

      };

      $scope.addTransaction = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/walletTransaction.html',
          size: 'lg',
          resolve: {
            wallet: function(){
              return $scope.wallet;
            }
          },
          controller: 'walletTransactionCtrl'
        });
      }

    });
  }
)();
