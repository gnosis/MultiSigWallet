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

      $scope.currentPage = 1;
      $scope.itemsPerPage = 5;
      $scope.totalItems = 0;
      $scope.showTxs = "all";

      $scope.updateParams = function(){

        $scope.showExecuted = true;
        $scope.showPending = true;

        if($scope.showTxs == "pending"){
          $scope.showExecuted = false;
        }
        else if($scope.showTxs == "executed"){
          $scope.showPending = false;
        }

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
              if(required){
                $scope.required = required.toNumber();
                $scope.$apply();
              }
            }
          )
        )

        // Get Transaction count
        batch.add(
          Wallet
          .getTransactionCount(
            $routeParams.address,
            $scope.showPending,
            $scope.showExecuted,
            function(e, items){
              $scope.totalItems = items;
              $scope.$apply();
              $scope.updateTransactions();
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

      $scope.getType = function(tx){
        return Wallet.getType(tx);
      }

      $scope.updateTransactions = function(){
        // Get all transaction hashes, with filters
        var from = $scope.itemsPerPage*($scope.currentPage-1);
        var to = $scope.currentPage*$scope.itemsPerPage;

        Wallet.getTransactionHashes(
          $scope.wallet.address,
          from,
          to>$scope.totalItems?$scope.totalItems:to,
          $scope.showPending,
          $scope.showExecuted,
          function(e, hashes){
            var txBatch = Wallet.web3.createBatch();
            $scope.transactions = {};

            hashes.map(function(tx){
              $scope.transactions[tx] = {};
              // Get transaction info
              txBatch.add(
                Wallet.getTransaction($scope.wallet.address, tx, function(e, info){
                  Object.assign($scope.transactions[tx], info);

                  $scope.$apply();
                })
              );
              // Get transaction confirmations
              txBatch.add(
                Wallet.getConfirmations($scope.wallet.address, tx, function(e, confirmations){
                  $scope.transactions[tx].confirmations = confirmations;
                  if(confirmations.indexOf(Wallet.coinbase) != -1){
                    $scope.transactions[tx].confirmed=true;
                  }
                  $scope.$apply();
                })
              );
            });

            txBatch.execute();

        }).call();
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
          templateUrl: 'partials/modals/addWalletOwner.html',
          size: 'md',
          controller: 'addOwnerCtrl',
          resolve: {
            wallet: function(){
              return $scope.wallet;
            }
          }
        });
      }

      $scope.confirmTransaction = function(txHash){
        $uibModal.open(
          {
            templateUrl: 'partials/modals/confirmTransaction.html',
            size: 'md',
            resolve: {
              address: function(){
                return $scope.wallet.address;
              },
              txHash: function(){
                return txHash;
              }
            },
            controller: 'confirmTransactionCtrl'
          }
        );
      }

      $scope.revokeConfirmation = function(txHash){
        $uibModal.open(
          {
            templateUrl: 'partials/modals/revokeConfirmation.html',
            size: 'md',
            resolve: {
              address: function(){
                return $scope.wallet.address;
              },
              txHash: function(){
                return txHash;
              }
            },
            controller: 'revokeCtrl'
          }
        );
      }

      $scope.removeOwner = function(owner){
        if(!$scope.wallet.owners[owner]){
          $scope.wallet.owners[owner] = {address: owner};
        }
        $uibModal.open(
          {
            templateUrl: 'partials/modals/removeOwner.html',
            size: 'md',
            resolve: {
              wallet: function(){
                return $scope.wallet;
              },
              owner: function(){
                return $scope.wallet.owners[owner];
              }
            },
            controller: 'removeOwnerCtrl'
          }
        );
      }

      $scope.editOwner = function(owner){
        if(!$scope.wallet.owners[owner]){
          $scope.wallet.owners[owner] = {address: owner};
        }
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
