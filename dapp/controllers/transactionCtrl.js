(
  function(){
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function($scope, Wallet, Utils, Transaction){

      $scope.transactions = Transaction.transactions;

      $scope.totalItems = Object.keys($scope.transactions).length;
      $scope.currentPage = 1;
      $scope.itemsPerPage = 10;

    });
  }
)();
