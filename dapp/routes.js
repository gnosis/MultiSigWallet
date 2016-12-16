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
      .when("/wallet/:address/transaction", {
        controller: 'walletTransactionCtrl',
        templateUrl: 'partials/walletTransaction.html'
      })
      .when("/wallet/:address/update-required", {
        controller: 'updateRequiredCtrl',
        templateUrl: 'partials/updateRequired.html'
      })
      .when("/wallet/:address/deposit", {
        controller: 'depositCtrl',
        templateUrl: 'partials/deposit.html'
      })      
      .otherwise({
        redirectTo: '/wallets'
      });
    });
  }
)();
