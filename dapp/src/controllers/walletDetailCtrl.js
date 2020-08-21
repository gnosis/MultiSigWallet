(
  function () {
    angular
      .module("multiSigWeb")
      .controller("walletDetailCtrl", function ($scope, $filter, $routeParams, $uibModal, $interval, $location, ABI, Token, Utils, Wallet, Web3Service) {
        $scope.wallet = {};

        // Javascript doesn't have a deep object copy, this is a patch
        // Convert $routeParams.address to checksum address, users might be using lowercase addresses
        var walletCopy = Wallet.getAllWallets()[Web3Service.toChecksumAddress($routeParams.address)];

        if (!walletCopy) {
          // redirect to 404
          $location.path('/404');
          return;
        }

        $scope.$watch(
          function () {
            return Wallet.updates;
          },
          function () {
            var tokenAddresses = Object.keys(walletCopy.tokens);
            // The token collection is updated by the controller and the service, so must be merged.
            tokenAddresses.map(function (item) {
              // Initialize, user token balance
              if (!$scope.userTokens[item]) {
                $scope.userTokens[item] = {};
              }
              // Assign token to user tokens collection
              Object.assign($scope.userTokens[item], walletCopy.tokens[item]);

              // If token has a previous balance, copy it
              if ($scope.wallet.tokens && $scope.wallet.tokens[item] && walletCopy.tokens && walletCopy.tokens[item]) {
                walletCopy.tokens[item].balance = $scope.wallet.tokens[item].balance;
              }
            });

            Object.assign(walletCopy, $scope.wallet);
            $scope.wallet = walletCopy;

            $scope.totalTokens = Object.keys($scope.wallet.tokens).length;
          }
        );
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
        // Get address book from localStorage
        $scope.addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');

        $scope.showSafeMigrationModal = function () {
          $uibModal.open({
            templateUrl: 'partials/modals/safeMigration.html',
            size: 'lg',
            resolve: {
              wallet: walletCopy
            },
            controller: function ($scope, $uibModalInstance, Wallet, wallet) {

              $scope.data = {
                hideMigrationModal: walletCopy.safeMigrated
              };

              // Get number of confirmations
              Wallet
              .getRequired(
                wallet.address,
                function (e, confirmations) {
                  $scope.data.threshold = confirmations.toNumber();
                }
              ).call();

              // Get owners
              Wallet.getOwners(wallet.address, function (e, owners) {
                if (e) {
                    Utils.dangerAlert(e);
                    return;
                }

                $scope.data.owners = owners.map(function (address) { return Web3Service.toChecksumAddress(address); });
              }).call();

              $scope.create = function () {

                var ownersAddresses = $scope.data.owners; // Object.keys(wallet.owners);
                var ownersNames = [];

                for (var address of ownersAddresses) {
                  ownersNames.push(wallet.owners[address].name);
                }

                var url = 'https://gnosis-safe.io/app/#/open';
                url += '?name=' + encodeURI(wallet.name);
                url += '&threshold=' + $scope.data.threshold;
                url += '&owneraddresses=' + ownersAddresses.join(',');
                url += '&ownernames=' + encodeURI(ownersNames.join(','));

                window.open(url);
                $scope.dismiss();
              };

              $scope.dismiss = function () {
                if ($scope.data.hideMigrationModal == true) {
                  // Don't show this modal again
                  wallet.safeMigrated = true;
                } else {
                  wallet.safeMigrated = false;
                }
                Wallet.updateWallet(wallet);
                $uibModalInstance.dismiss();
              };
            }
          });
        };

        $scope.updateParams = function () {

          var batch = Web3Service.web3.createBatch();

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
                  $scope.owners = Web3Service.toChecksumAddress(owners);
                  // Check if the owners are in the wallet.owners object
                  var walletOwnerskeys = $scope.wallet.owners ? Object.keys($scope.wallet.owners) : [];

                  if (!$scope.wallet.owners) {
                    $scope.wallet.owners = {};
                    $scope.owners.forEach(function (item, index) {
                      $scope.wallet.owners[item] = {
                        'name': 'Owner ' + (index + 1),
                        'address': item
                      };
                      if (index == $scope.owners.length-1) { // last item
                        Wallet.updateWallet($scope.wallet);
                      }
                    });
                  } else {
                    for (var x = 0; x < $scope.owners.length; x++) {
                      // If owner not in list
                      if (walletOwnerskeys.indexOf($scope.owners[x]) == -1) {
                        $scope.wallet.owners[$scope.owners[x]] = {
                          'name': 'Owner ' + (x + 1),
                          'address': $scope.owners[x]
                        };
                      }
                      else {
                        if (!$scope.wallet.owners[$scope.owners[x]].name) {
                          // Set owner name with its address
                          // $scope.wallet.owners[$scope.owners[x]].name = $scope.wallet.owners[$scope.owners[x]].address;
                          $scope.wallet.owners[$scope.owners[x]].name = 'Owner ' + (x + 1);
                        }
                      }
                    }
                  }
                }
              )
          );

          // Get ETH Balance
          batch.add(
            Wallet.getBalance(
              $scope.wallet.address,
              function (e, balance) {
                if (!e && balance) {
                  $scope.balance = balance;
                }
              }
            )
          );

          // Get required confirmations
          batch.add(
            Wallet
              .getRequired(
                $scope.wallet.address,
                function (e, confirmations) {
                  $scope.$apply(function () {
                    $scope.confirmations = confirmations;
                  });
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
                    $scope.$apply(function () {
                      $scope.required = required.toNumber();
                    });
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
                  $scope.updateTransactions();

                }
              )
          );

          // Get token info
          if ($scope.wallet.tokens) {
            Object.keys($scope.wallet.tokens)
              .map(
                function (token) {

                  // Get multisig balance
                  batch.add(
                    Token.balanceOf(
                      token,
                      $scope.wallet.address,
                      function (e, balance) {
                        if ($scope.wallet.tokens[token]) {
                          $scope.wallet.tokens[token].balance = balance;
                          Wallet.triggerUpdates();
                        }
                      }
                    )
                  );

                  // Get account balance
                  batch.add(
                    Token.balanceOf(
                      token,
                      Web3Service.coinbase,
                      function (e, balance) {
                        $scope.userTokens[token].balance = balance;
                        Wallet.triggerUpdates();
                      }
                    )
                  );
                }
              );
          }

          batch.execute();
        };

        function startup() {
          Wallet
            .initParams()
            .then(function () {
              $scope.updateParams();
              $scope.interval = $interval($scope.updateParams, 15000);

              // Handle migration modal
              if (!walletCopy.safeMigrated) {
                $scope.showSafeMigrationModal();
              }
            });
        }
        startup();

        $scope.$on('$destroy', function () {
          $interval.cancel($scope.interval);
        });

        $scope.getOwnerName = function (address) {
          if ($scope.wallet.owners && $scope.wallet.owners[address]) {
            return $scope.wallet.owners[address].name;
          }
        };

        $scope.getParam = function (tx) {
          if (tx.data && tx.data.length > 3) {
            var method = tx.data.slice(2, 10);
            var owner = "0x1";
            if (tx.data && tx.data.length > 12) {
              owner = '0x' + new Web3().toBigNumber("0x" + tx.data.slice(11)).toString(16);
            }
            switch (method) {
              case "ba51a6df":
                var confirmations = new Web3().toBigNumber("0x" + tx.data.slice(11)).toString();
                return {
                  title: "Change required confirmations to " + confirmations
                };
              case "7065cb48":
                return {
                  title: "Add owner " + $filter("addressCanBeOwner")(owner, $scope.wallet)
                };
              case "173825d9":
                return {
                  title: "Remove owner " + $filter("addressCanBeOwner")(owner, $scope.wallet)
                };
              case "cea08621":
                var limit = $filter("ether")("0x" + tx.data.slice(11));
                return {
                  title: "Change daily limit to " + limit
                };
              case "a9059cbb":
                var tokenAddress = tx.to;
                var account = Web3Service.toChecksumAddress("0x" + tx.data.slice(34, 74));
                var token = {};
                Object.assign(token, $scope.wallet.tokens[tokenAddress]);
                token.balance = new Web3().toBigNumber("0x" + tx.data.slice(74));

                var filteredAddress = $filter("addressBookNameOrFalse")(account, $scope.wallet);

                if (!filteredAddress) {
                  // address is not an item in address book
                  filteredAddress = $filter("addressCanBeOwner")(account, $scope.wallet);
                }

                return {
                  title: "Transfer " + $filter("token")(token) + " to " + filteredAddress
                };
              case "e20056e6":
                var oldOwner = "0x" + tx.data.slice(34, 74);
                var newOwner = "0x" + tx.data.slice(98, 138);
                return {
                  title: "Replace owner " + $filter("addressCanBeOwner")(oldOwner, $scope.wallet) + " with " + $filter("addressCanBeOwner")(newOwner, $scope.wallet)
                };
              default:
                // Check abis in cache
                var abis = ABI.get();
                var decoded = ABI.decode(tx.data);

                if (abis[tx.to] && abis[tx.to].abi) {
                  decoded.usedABI = true;
                  return decoded;
                }
                else {
                  if (decoded) {
                    return decoded;
                  }
                  else if (tx.data.length > 20) {
                    return {
                      title: tx.data.slice(0, 20) + "...",
                      notDecoded: true
                    };
                  }
                  else {
                    return {
                      title: tx.data.slice(0, 20),
                      notDecoded: true
                    };
                  }
                }
            }
          }
          // Check if trasanction was sent to an item in address book
          else if ($scope.addressBook && $scope.addressBook[tx.to]) {
            return {
              title: "Transfer " + $filter("ether")(tx.value) + " to " + $scope.addressBook[tx.to].name
            }
          }
          else {
            return {
              title: "Transfer " + $filter("ether")(tx.value) + " to " + $filter("addressCanBeOwner")(tx.to, $scope.wallet)
            };
          }
        };

        $scope.getDestination = function (tx) {
          if (Wallet.wallets[tx.to]) {
            // Destination is a Wallet
            return Wallet.wallets[tx.to].name;
          }
          else if ($scope.wallet.owners && $scope.wallet.owners[tx.to] && $scope.wallet.owners[tx.to].name) {
            // Destination is one of the owners of a wallet
            return $scope.wallet.owners[tx.to].name;
          }
          // Destination is a Token
          else if ($scope.wallet.tokens && $scope.wallet.tokens[tx.to] && $scope.wallet.tokens[tx.to].name) {
            return $scope.wallet.tokens[tx.to].name;
          }
          else if ($scope.addressBook && $scope.addressBook[tx.to]) {
            // Destination is an item in address book
            return $scope.addressBook[tx.to].name;
          }
          else {
            var abis = ABI.get();
            if (abis[tx.to] && abis[tx.to].name) {
              return abis[tx.to].name;
            }
            else {
              return tx.to.slice(0, 10) + "...";
            }
          }
        };

        $scope.updateTransactions = function () {
          // Get all transaction ids, with filters
          var from = $scope.totalItems - $scope.itemsPerPage * ($scope.currentPage);
          var to = $scope.totalItems - ($scope.currentPage - 1) * $scope.itemsPerPage;

          Wallet.getTransactionIds(
            $scope.wallet.address,
            from > 0 ? from : 0,
            to,
            $scope.showPending,
            $scope.showExecuted,
            function (e, ids) {
              var txBatch = Web3Service.web3.createBatch();
              if (!$scope.transactions) {
                $scope.transactions = {};
              }

              $scope.txIds = ids.slice(0).reverse();
              ids.map(function (tx) {
                if (!$scope.transactions[tx]) {
                  $scope.transactions[tx] = {};
                }
                // Get transaction info
                txBatch.add(
                  Wallet.getTransaction($scope.wallet.address, tx, function (e, info) {
                    if (!e && info.to) {
                      // Convert to checksum address
                      info.to = Web3Service.toChecksumAddress(info.to);
                      $scope.$apply(function () {
                        // Added reference to the wallet
                        info.from = $scope.wallet.address;
                        Object.assign($scope.transactions[tx], info);

                        var savedABI = ABI.get()[info.to];

                        // Get data info if data has not being decoded, because is a new transactions or we don't have the abi to do it
                        if (!$scope.transactions[tx].dataDecoded || $scope.transactions[tx].dataDecoded.notDecoded || ($scope.transactions[tx].dataDecoded.usedABI && (!savedABI || savedABI.abi))) {
                          $scope.transactions[tx].dataDecoded = $scope.getParam($scope.transactions[tx]);
                        }
                        // If destionation type has not been set
                        if (!$scope.transactions[tx].destination) {
                          $scope.transactions[tx].destination = $scope.getDestination($scope.transactions[tx]);
                        }
                      });
                    }
                  })
                );
                // Get transaction confirmations
                txBatch.add(
                  Wallet.getConfirmations($scope.wallet.address, tx, function (e, confirmations) {
                    $scope.$apply(function () {
                      $scope.transactions[tx].confirmations = Web3Service.toChecksumAddress(confirmations);
                      // If the current user is among the array of confirmations, we can set the transaction
                      // as confirmed by that user
                      if ($scope.transactions[tx].confirmations.indexOf(Web3Service.coinbase) != -1) {
                        $scope.transactions[tx].confirmed = true;
                      }
                      else {
                        $scope.transactions[tx].confirmed = false;
                      }
                    });
                  })
                );
              });

              txBatch.execute();
            }).call();
        };

        /*$scope.getOwners = function () {
          var batch = Web3Service.web3.createBatch();
          $scope.owners = [];

          function assignOwner (e, owner) {
            if (owner) {
              $scope.$apply(function () {
                $scope.owners.push(owner);
              });
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
        };*/

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

        $scope.replaceOwner = function (owner) {
          $uibModal.open({
            templateUrl: 'partials/modals/replaceOwner.html',
            size: 'md',
            controller: 'replaceOwnerCtrl',
            resolve: {
              wallet: function () {
                return $scope.wallet;
              },
              owner: function () {
                return $scope.wallet.owners[owner];
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

        $scope.replaceOwnerOffline = function () {
          $uibModal.open({
            templateUrl: 'partials/modals/replaceOwnerOffline.html',
            size: 'md',
            resolve: {
              wallet: function () {
                return $scope.wallet;
              }
            },
            controller: 'replaceOwnerOfflineCtrl'
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
          $uibModal.open(
            {
              templateUrl: 'partials/modals/confirmTransactionOffline.html',
              size: 'md',
              resolve: {
                address: function () {
                  return $scope.wallet.address;
                }
              },
              controller: 'confirmMultisigTransactionOfflineCtrl'
            }
          );
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
          $uibModal.open(
            {
              templateUrl: 'partials/modals/revokeMultisigConfirmationOffline.html',
              size: 'md',
              resolve: {
                address: function () {
                  return $scope.wallet.address;
                }
              },
              controller: 'confirmMultisigTransactionOfflineCtrl'
            }
          );
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

        $scope.executeMultisigTransactionOffline = function () {
          $uibModal.open(
            {
              templateUrl: 'partials/modals/executeMultisigTransactionOffline.html',
              size: 'md',
              resolve: {
                address: function () {
                  return $scope.wallet.address;
                }
              },
              controller: 'confirmMultisigTransactionOfflineCtrl'
            }
          );
        };

        $scope.removeOwner = function (owner) {
          if (!$scope.wallet.owners[owner]) {
            $scope.wallet.owners[owner] = { address: owner };
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
            $scope.wallet.owners[owner] = { address: owner };
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
              if (owner.name == undefined || owner.name == '') {
                owner.name = owner.address;
              }
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
          })
            .result
            .then(
              function () {
                $scope.updateParams();
              }
            );
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
          })
            .result
            .then(
              function () {
                $scope.updateParams();
              }
            );
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
                if (!Object.keys($scope.wallet.tokens).length) {
                  $scope.wallet.tokens = null;
                }
                Wallet.updateWallet($scope.wallet);
                $uibModalInstance.close();
              };

              $scope.cancel = function () {
                $uibModalInstance.dismiss();
              };
            }
          })
            .result
            .then(
              function () {
                $scope.updateParams();
              }
            );
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

        $scope.editABI = function (to) {
          $uibModal.open({
            templateUrl: 'partials/modals/editABI.html',
            size: 'md',
            resolve: {
              to: function () {
                return to;
              },
              cb: function () {
                return $scope.updateTransactions;
              }
            },
            controller: 'editABICtrl'
          });
        };
      });
  }
)();
