(
  function () {
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function ($scope, $sce, Wallet, Utils, Transaction, $uibModal, $filter) {

      $scope.$watch(
        function () {
          return Transaction.updates;
        },
        function () {
          var transactions = Transaction.transactions;
          var txArray = [];

          for (txKey in transactions) {
              txArray.push(transactions[txKey]);
          }

          // Transactions sorted by tx.date DESC
          $scope.transactions = txArray.sort(
            function (a, b) {
              var dateA = new Date(a.date).getTime();
              var dateB = new Date(b.date).getTime();

              if ( dateA > dateB) {
                return -1;
              }
              else {
                return 1;
              }
            }
          );

          $scope.totalItems = Object.keys($scope.transactions).length;
        }
      );

      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;
      $scope.wallets = Wallet.wallets;

      $scope.remove = function (txHash) {
        Utils.confirmation("Remove transaction", "Are you sure?", function () {
          Transaction.remove(txHash);
        });
      };

      $scope.removeAll = function () {
        Utils.confirmation("Remove all transactions", "Are you sure?", function () {
          Transaction.removeAll();
        });
      };

      $scope.sendRawTransaction = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/signedTransaction.html',
          size: 'md',
          controller: 'signedTransactionCtrl'
        });
      };

      $scope.sendTransaction = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/sendTransaction.html',
          size: 'lg',
          controller: 'sendTransactionCtrl'
        });
      };

      $scope.getNonce = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/getNonce.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance, Wallet, Utils) {
            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };

            $scope.ok = function () {
              Wallet.web3.eth.getTransactionCount(
                $scope.address,
                function (e, count) {
                  if (e) {
                    Utils.dangerAlert(e);
                  }
                  else {
                    $uibModalInstance.close();
                    Utils.success("Nonce: " + count);
                  }
                }
              );
            };
          }
        });
      };

      // @Deprecated, use getDestinationOrContract() instead
      // $scope.getTo = function (to) {
      //   if (Wallet.wallets[to] && Wallet.wallets[to].name) {
      //     return Wallet.wallets[to].name;
      //   }
      //   else {
      //     return $filter("address")(to);
      //   }
      // };

      /**
      * Returns the transaction or contract address
      */
      $scope.getDestinationOrContract = function (tx) {
        if (tx && tx.info && Wallet.wallets[tx.info.to] && Wallet.wallets[tx.info.to].name) {
          return Wallet.wallets[tx.info.to].name + " wallet";
        }
        if (tx && tx.multisig) {
          if( Wallet.wallets[tx.multisig] ) {
            return "Create wallet " + Wallet.wallets[tx.multisig].name;
          }
          else {
            return "Create wallet " + tx.multisig.slice(0, 10) + "...";
          }
        }
        else if (tx && tx.receipt && tx.receipt.contractAddress) {
          return 'Contract ' + $filter("address")(tx.receipt.contractAddress);
        }
        else {
          if (tx.info) {
            // Check if Tx.info.to refers to an owner
            var walletsKeys = Object.keys(Wallet.wallets);

            for (var x=0; x<walletsKeys.length; x++) {

              if (Wallet.wallets[walletsKeys[x]].owners
                    && Object.keys(Wallet.wallets[walletsKeys[x]].owners).indexOf(tx.info.to) != -1) {

                var ownersKeys = Object.keys(Wallet.wallets[walletsKeys[x]].owners);
                var ownerKey = ownersKeys[ownersKeys.indexOf(tx.info.to)];

                return $sce.trustAsHtml("<i class='fa fa-user-o' aria-hidden='true'></i>&nbsp;" + Wallet.wallets[walletsKeys[x]].owners[ownerKey].name);

              }
            }

            return $filter("address")(tx.info.to);
          }

          return $filter("dashIfEmpty")(null);
        }
      };

      $scope.decodeLogs = function (logs) {

        return Wallet.decodeLogs(logs);
      };

    });
  }
)();
