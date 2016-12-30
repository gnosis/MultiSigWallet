(
  function () {
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function ($scope, Wallet, Utils, Transaction, $uibModal, $filter) {


      $scope.$watch(
        function () {
          return Transaction.transactions;
        },
        function () {
          $scope.transactions = Transaction.transactions;
          $scope.totalItems = Object.keys($scope.transactions).length;
        }
      );

      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      $scope.remove = function (txHash) {
        Transaction.remove(txHash);
      };

      $scope.removeAll = function () {
        Transaction.removeAll();
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

      $scope.getTo = function (to) {
        if (Wallet.wallets[to] && Wallet.wallets[to].name) {
          return Wallet.wallets[to].name;
        }
        else {
          return $filter("address")(to);
        }
      };

    });
  }
)();
