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
      .when("/send-transaction", {
        controller: 'sendTransactionCtrl',
        templateUrl: 'partials/sendTransaction.html'
      })
      .when("/wallet/:address", {
        controller: 'walletDetailCtrl',
        templateUrl: 'partials/walletDetail.html'
      })
      .when("/wallet/:address/transaction", {
        controller: 'walletTransactionCtrl',
        templateUrl: 'partials/walletTransaction.html'
      })
      .when("/settings", {
        controller: 'settingsCtrl',
        templateUrl: 'partials/settings.html'
      })
      .otherwise({
        redirectTo: '/wallets'
      });
    });
  }
)();
