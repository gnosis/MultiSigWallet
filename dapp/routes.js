(
  function(){
    angular
    .module('multiSigWeb')
    .config(function($routeProvider){
      $routeProvider
      .when("/wallets", {
        controller: 'walletCtrl',
        templateUrl: 'partials/wallet.html'
      })
      .when("/transactions", {
        controller: 'transactionCtrl',
        templateUrl: 'partials/transactions.html'
      })
      .when("/send-raw-transaction", {
        controller: 'rawTransactionCtrl',
        templateUrl: 'partials/rawTransaction.html'
      })
      .otherwise({
        redirectTo: '/wallets'
      });
    });
  }
)();
