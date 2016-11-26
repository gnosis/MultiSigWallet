(
  function(){
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function($scope, Wallet, Utils, Transaction){


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

    });
  }
)();
