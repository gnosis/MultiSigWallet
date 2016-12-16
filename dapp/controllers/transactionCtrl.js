(
  function(){
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function($scope, Wallet, Utils, Transaction, $uibModal){


      $scope.$watch(
        function(){
          return Transaction.transactions;
        },
        function(){
          $scope.transactions = Transaction.transactions;
          $scope.totalItems = Object.keys($scope.transactions).length;
        }
      );

      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

      $scope.remove = function(txHash){
        Transaction.remove(txHash);
      }

      $scope.removeAll = function(){
        Transaction.removeAll();
      }

      $scope.sendSignedTransaction = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/signedTransaction.html',
          size: 'md',
          controller: 'signedTransactionCtrl'
        });
      }

      $scope.sendTransaction = function(){
        $uibModal.open({
          templateUrl: 'partials/modals/sendTransaction.html',
          size: 'lg',
          controller: 'sendTransactionCtrl'
        });
      }

    });
  }
)();
