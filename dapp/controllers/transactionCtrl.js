(
  function () {
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function ($scope, $sce, Wallet, Utils, Transaction, $uibModal, $filter, ABI) {

      $scope.$watch(
        function () {
          return Transaction.updates;
        },
        function () {
          var transactions = Transaction.transactions;
          var txArray = [];

          for (var txKey in transactions) {
              txArray.push(transactions[txKey]);

              if (transactions[txKey].info && (!transactions[txKey].decodedData || transactions[txKey].decodedData.notDecoded)) {
                if (transactions[txKey].info.input !== "0x" && transactions[txKey].info.input.data !== "0x0") {
                  // Decode data
                  var abis = ABI.get();
                  var savedABI = abis[transactions[txKey].info.to];
                  if (savedABI) {
                    transactions[txKey].decodedData = ABI.decode(savedABI.abi, transactions[txKey].info.input);
                  }
                  else if (Wallet.wallets[transactions[txKey].info.to]) {
                    transactions[txKey].toWallet = true;
                    transactions[txKey].decodedData = ABI.decode(Wallet.json.multiSigDailyLimit.abi, transactions[txKey].info.input);
                  }
                  else {
                    transactions[txKey].decodedData = {
                      title: transactions[txKey].info.input.slice(0, 20) + "...",
                      notDecoded: true
                    };
                  }
                }
                else {
                  transactions[txKey].decodedData = {
                    title: "",
                    notDecoded: true
                  };
                }

              }
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
          controller: 'nonceCtrl'
        });
      };

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
          else {
            return "Create wallet " + tx.multisig.slice(0, 10) + "...";
          }
        }
        else if (tx && tx.receipt && tx.receipt.contractAddress) {
          return 'Contract ' + $filter("address")(tx.receipt.contractAddress);
        }
        else {
          if (tx.info) {
            // Check if Tx.info.to refers to an owner or a token
            var walletsKeys = Object.keys(Wallet.wallets);

            for (var x=0; x<walletsKeys.length; x++) {

              if (Wallet.wallets[walletsKeys[x]].owners && Wallet.wallets[walletsKeys[x]].owners[tx.info.to]) {
                return Wallet.wallets[walletsKeys[x]].owners[tx.info.to].name;
              }
              else if (Wallet.wallets[walletsKeys[x]].tokens && Wallet.wallets[walletsKeys[x]].tokens[tx.info.to]) {
                return Wallet.wallets[walletsKeys[x]].tokens[tx.info.to].name;
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

      $scope.editABI = function (to) {
        $uibModal.open({
          templateUrl: 'partials/modals/editABI.html',
          size: 'md',
          resolve: {
            to: function () {
              return to;
            },
            cb: function () {
              return Transaction.notifyObservers;
            }
          },
          controller: 'editABICtrl'
        });
      };

    });
  }
)();
