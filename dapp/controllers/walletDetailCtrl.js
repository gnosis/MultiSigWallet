(
  function () {
    angular
    .module("multiSigWeb")
    .controller("walletDetailCtrl", function ($scope, Wallet, $routeParams, Utils, Transaction, $interval, $uibModal, Token) {
      $scope.wallet = Wallet.wallets[$routeParams.address];
      // Get wallet balance, nonce, transactions, owners
      $scope.owners = [];
      $scope.transactions = {};
      $scope.userTokens = {};

      $scope.currentPage = 1;
      $scope.itemsPerPage = 5;
      $scope.totalItems = 0;
      $scope.showTxs = "all";
      $scope.hideOwners = true;
      $scope.hideTokens = true;

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
            $scope.wallet.address,
            function (e, owners) {
              $scope.owners = owners;
              // Check if the owners are in the wallet.owners object
              var walletOwnerskeys = Object.keys($scope.wallet.owners);

              for (var x=0; x<owners.length; x++){
                if (walletOwnerskeys.indexOf($scope.owners[x]) == -1) {
                  $scope.wallet.owners[$scope.owners[x]] = {
                    'name' : '',
                    'address' : $scope.owners[x]
                  }
                }
              }

              Wallet.updateWallet($scope.wallet);

              $scope.$apply();
            }
          )
        );

        // Get required confirmations
        batch.add(
          Wallet
          .getRequired(
            $scope.wallet.address,
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
            $scope.wallet.address,
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
            $scope.wallet.address,
            $scope.showPending,
            $scope.showExecuted,
            function (e, items) {
              $scope.totalItems = items.toNumber();
              $scope.$apply();
              $scope.updateTransactions();
            }
          )
        );

        // Get token info
        if ($scope.wallet.tokens) {
          Object.keys($scope.wallet.tokens)
          .map(
            function (token) {
              // Assign token to user tokens collection
              $scope.userTokens[token] = {};
              Object.assign($scope.userTokens[token], $scope.wallet.tokens[token]);

              // Get multisig balance
              batch.add(
                Token.balanceOf(
                  token,
                  $scope.wallet.address,
                  function (e, balance) {
                    $scope.wallet.tokens[token].balance = balance;
                    $scope.$apply();
                  }
                )
              );

              // Get account balance
              batch.add(
                Token.balanceOf(
                  token,
                  Wallet.coinbase,
                  function (e, balance) {
                    // console.log($scope.userTokens, token, balance.toNumber(), Wallet.coinbase)
                    $scope.userTokens[token].balance = balance;
                    $scope.$apply();
                  }
                )
              );
            }
          );
        }

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
              return tx.data.slice(0, 20) + "...";
          }
        }
        else {
          if ( tx.data && tx.data.length> 3) {
            return tx.data.slice(0, 20) + "...";
          }
        }
      };

      $scope.updateTransactions = function () {
        // Get all transaction ids, with filters
        var from = $scope.totalItems-$scope.itemsPerPage*($scope.currentPage);
        var to = $scope.totalItems-($scope.currentPage-1)*$scope.itemsPerPage;

        Wallet.getTransactionIds(
          $scope.wallet.address,
          from>0?from:0,
          to,
          $scope.showPending,
          $scope.showExecuted,
          function (e, ids) {
            var txBatch = Wallet.web3.createBatch();
            $scope.transactions = {};
            $scope.txIds = ids.slice(0).reverse();
            ids.map(function (tx) {
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
        }

        for(var i=0; i<$scope.ownersNum; i++){
          // Get owners
          batch.add(
            Wallet
            .getOwners(
              $scope.wallet.address,
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

      /**
      * Remove owner in offline mode.
      */
      $scope.removeOwnerOffline = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/removeWalletOwnerOffline.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            }
          },
          controller: function ($scope, $uibModalInstance, wallet) {
            $scope.owner = {};

            $scope.sign = function () {
              Wallet.removeOwnerOffline(wallet.address, $scope.owner, function (e, tx) {
                if (e) {
                  Utils.dangerAlert(e);
                }
                else {
                  $uibModalInstance.close();
                  Utils.signed(tx);
                }
              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      $scope.confirmTransaction = function (txId) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/confirmTransaction.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txId: function () {
                return txId;
              }
            },
            controller: 'confirmTransactionCtrl'
          }
        );
      };

      $scope.confirmMultisigTransactionOffline = function () {
        Wallet.confirmTransactionOffline($scope.wallet.address, function (e, signed) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.signed(signed);
          }
        });
      };

      $scope.revokeConfirmation = function (txId) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/revokeConfirmation.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txId: function () {
                return txId;
              }
            },
            controller: 'revokeCtrl'
          }
        );
      };

      $scope.revokeMultisigTransactionOffline = function () {
        Wallet.revokeConfirmationOffline($scope.wallet.address, function (e, signed) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else {
            Utils.signed(signed);
          }
        });
      };

      $scope.executeTransaction = function (txId) {
        $uibModal.open(
          {
            templateUrl: 'partials/modals/executeTransaction.html',
            size: 'md',
            resolve: {
              address: function () {
                return $scope.wallet.address;
              },
              txId: function () {
                return txId;
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

      $scope.addToken = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/editToken.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            },
            token: function () {
              return {};
            }
          },
          controller: 'addTokenCtrl'
        });
      };

      $scope.editToken = function (token) {
        $uibModal.open({
          templateUrl: 'partials/modals/editToken.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            },
            token: function () {
              return token;
            }
          },
          controller: 'addTokenCtrl'
        });
      };

      $scope.removeToken = function (token) {
        $uibModal.open({
          templateUrl: 'partials/modals/removeToken.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            },
            token: function () {
              return token;
            }
          },
          controller: function ($scope, token, wallet, Wallet, $uibModalInstance) {
            $scope.token = token;
            $scope.wallet = wallet;

            $scope.ok = function () {
              delete $scope.wallet.tokens[token.address];
              if( !Object.keys($scope.wallet.tokens).length) {
                $scope.wallet.tokens = null;
              }
              Wallet.updateWallet($scope.wallet);
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      $scope.depositToken = function (token) {
        $uibModal.open({
          templateUrl: 'partials/modals/depositToken.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            },
            token: function () {
              return token;
            }
          },
          controller: 'depositTokenCtrl'
        });
      };

      $scope.withdrawToken = function (token) {
        $uibModal.open({
          templateUrl: 'partials/modals/withdrawToken.html',
          size: 'md',
          resolve: {
            wallet: function () {
              return $scope.wallet;
            },
            token: function () {
              return token;
            }
          },
          controller: 'withdrawTokenCtrl'
        });
      };

    });
  }
)();
