(
  function () {
    angular
    .module('multiSigWeb')
    .config(function($routeProvider){
      $routeProvider
      .when("/wallets", {
        controller: 'walletCtrl',
        templateUrl: 'partials/wallets.html'
      })
      .when("/transactions", {
        controller: 'transactionCtrl',
        templateUrl: 'partials/transactions.html'
      })
      .when("/wallet/:address", {
        controller: 'walletDetailCtrl',
        templateUrl: 'partials/wallet.html'
      })
      .when("/settings", {
        controller: 'settingsCtrl',
        templateUrl: 'partials/settings.html'
      })
      .when("/signup", {
        controller: 'notificationsSignupConfirmationCtrl',
        templateUrl: 'partials/wallets.html'
      })
      .otherwise({
        redirectTo: '/wallets'
      });
    });
  }
)();
