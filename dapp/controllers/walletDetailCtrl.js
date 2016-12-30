(
  function () {
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function ($scope, Wallet, $routeParams, Utils, Transaction, $interval, $uibModal) {
      $scope.wallet = Wallet.wallets[$routeParams.address];
      // Get wallet balance, nonce, transactions, owners
      $scope.owners = [];
      $scope.transactions = {};

      $scope.currentPage = 1;
      $scope.itemsPerPage = 5;
      $scope.totalItems = 0;
      $scope.showTxs = "all";
      $scope.hideOwners = true;

      $scope.updateParams = function () {

        var batch = Wallet.web3.createBatch();

        $scope.showExecuted = true;
        $scope.showPending = true;

        if ($scope.showTxs == "pending") {
          $scope.showExecuted = false;
        }
        else if ($scope.showTxs == "executed") {
          $scope.showPending = false;
        }

        // Get owners
        batch.add(
          Wallet
          .getOwners(
            $routeParams.address,
            function (e, owners) {
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
            function (e, nonces) {
              $scope.nonces = nonces;
              $scope.$apply();
            }
          )
        );

        // Get required confirmations
        batch.add(
          Wallet
          .getRequired(
            $routeParams.address,
            function (e, confirmations) {
              $scope.confirmations = confirmations;
              $scope.$apply();
            }
          )
        );

        // Get # required confirmations
        batch.add(
          Wallet
          .getRequired(
            $routeParams.address,
            function (e, required) {
              if (required) {
                $scope.required = required.toNumber();
                $scope.$apply();
              }
            }
          )
        );

        // Get Transaction count
        batch.add(
          Wallet
          .getTransactionCount(
            $routeParams.address,
            $scope.showPending,
            $scope.showExecuted,
            function (e, items) {
              $scope.totalItems = items;
              $scope.$apply();
              $scope.updateTransactions();
            }
          )
        );
        batch.execute();
      };

      Wallet
      .webInitialized
      .then(
        function () {
          Wallet
          .initParams()
          .then(function () {
            $scope.updateParams();
            $scope.interval = $interval($scope.updateParams, 15000);
          });
        }
      );


      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
      });

      $scope.getOwnerName = function (address) {
        if ($scope.wallet.owners && $scope.wallet.owners[address]){
          return $scope.wallet.owners[address].name;
        }
      };

      $scope.getType = function (tx) {
        return Wallet.getType(tx);
      };

      $scope.getParam = function (tx) {
        if (tx.data && tx.data.length > 3) {
          var method = tx.data.slice(2, 10);
          var owner = '0x' + new Web3().toBigNumber("0x" + tx.data.slice(11)).toString(16);
          switch (method) {
            case "ba51a6df":
              return new Web3().toBigNumber("0x" + tx.data.slice(11)).toString();
            case "7065cb48":
              if ($scope.wallet.owners && $scope.wallet.owners[owner] && $scope.wallet.owners[owner].name) {
                return $scope.wallet.owners[owner].name;
              }
              else{
                return owner;
              }
              break;
            case "173825d9":
              return owner;
            case "cea08621":
              return new Web3().toBigNumber("0x" + tx.data.slice(11)).div('1e18').toString() + " ETH";
            default:
              return tx.data.slice(0, 20);
          }
        }
        else {
          if ( tx.data && tx.data.length> 3) {
            return tx.data.slice(0, 20) + "...";
          }
        }
      };

      $scope.updateTransactions = function () {
        // Get all transaction hashes, with filters
        var from = $scope.totalItems-$scope.itemsPerPage*($scope.currentPage);
        var to = $scope.totalItems-($scope.currentPage-1)*$scope.itemsPerPage;

        Wallet.getTransactionHashes(
          $scope.wallet.address,
          from>0?from:0,
          to,
          $scope.showPending,
          $scope.showExecuted,
          function (e, hashes) {
            var txBatch = Wallet.web3.createBatch();
            $scope.transactions = {};
            $scope.txHashes = hashes.slice(0).reverse();
            hashes.map(function (tx) {
              $scope.transactions[tx] = {};
              // Get transaction info
              txBatch.add(
                Wallet.getTransaction($scope.wallet.address, tx, function (e, info) {
                  Object.assign($scope.transactions[tx], info);

                  $scope.$apply();
                })
              );
              // Get transaction confirmations
              txBatch.add(
                Wallet.getConfirmations($scope.wallet.address, tx, function (e, confirmations) {
                  $scope.transactions[tx].confirmations = confirmations;
                  if (confirmations.indexOf(Wallet.coinbase) != -1) {
                    $scope.transactions[tx].confirmed=true;
                  }
                  $scope.$apply();
                })
              );
            });

            txBatch.execute();
        }).call();
      };

      $scope.getOwners = function () {
        var batch = Wallet.web3.createBatch();
        $scope.owners = [];

        function assignOwner (e, owner) {
          if (owner) {
            $scope.owners.push(owner);
            $scope.$apply();
          }
        };

        for(var i=0; i<$scope.ownersNum; i++){
          // Get owners
          batch.add(
            Wallet
            .getOwners(
              $routeParams.address,
              i,
              assignOwner
            )
          );
        }
        batch.execute();
      };

      $scope.addOwner = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/addWalletOwner.html',
          size: 'md',
          controller: 'addOwnerCtrl',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            }
          }
        });
      };

      $scope.confirmTransaction = function (txHash) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/confirmTransaction.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txHash: function () {
                return txHash;
              }
            },
            controller: 'confirmTransactionCtrl'
          }
        );
      };

      $scope.revokeConfirmation = function (txHash) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/revokeConfirmation.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txHash: function () {
                return txHash;
              }
            },
            controller: 'revokeCtrl'
          }
        );
      };

      $scope.executeTransaction = function (txHash) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/executeTransaction.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txHash: function () {
                return txHash;
              }
            },
            controller: 'executeTransactionCtrl'
          }
        );
      };

      $scope.removeOwner = function (owner) {
        if (!$scope.wallet.owners[owner]) {
          $scope.wallet.owners[owner] = {address: owner};
        }
        $uibModal.open(
          {
            templateUrl: 'partials/modals/removeOwner.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return $scope.wallet;
              },
              owner: function () {
                return $scope.wallet.owners[owner];
              }
            },
            controller: 'removeOwnerCtrl'
          }
        );
      };

      $scope.editOwner = function (owner) {
        if (!$scope.wallet.owners[owner]) {
          $scope.wallet.owners[owner] = {address: owner};
        }
        $uibModal.open({
          templateUrl: 'partials/modals/editOwner.html',
          size: 'sm',
          resolve: {
            owner: function () {
              return $scope.wallet.owners[owner];
            }
          },
          controller: function ($scope, $uibModalInstance, owner) {
            $scope.owner = {
              address: owner.address,
              name: owner.name
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
        .then(function (owner) {
          $scope.wallet.owners[owner.address] = owner;
          Wallet.updateWallet($scope.wallet);
        });
      };

      $scope.addTransaction = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/walletTransaction.html',
          size: 'lg',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            }
          },
          controller: 'walletTransactionCtrl'
        });
      };

    });
  }
)();
