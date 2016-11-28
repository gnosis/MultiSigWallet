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
      .when("/send-transaction", {
        controller: 'sendTransactionCtrl',
        templateUrl: 'partials/sendTransaction.html'
      })
      .when("/wallet/:address", {
        controller: 'walletDetailCtrl',
        templateUrl: 'partials/walletDetail.html'
      })
      .otherwise({
        redirectTo: '/wallets'
      });
    });
  }
)();
