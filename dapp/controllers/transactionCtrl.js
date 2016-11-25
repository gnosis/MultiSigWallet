(
  function(){
    angular
    .module('multiSigWeb')
    .controller('transactionCtrl', function($scope, Wallet, Utils, Transaction){

      $scope.transactions = Transaction.transactions;
      
    });
  }
)();
