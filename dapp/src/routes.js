(
  function () {
    angular
    .module('multiSigWeb')
    .config(function($routeProvider, NotificationProvider){
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
      .when("/accounts", {
        // Only for Electron
        controller: 'accountCtrl',
        templateUrl: 'partials/accounts.html'
      })
      .when("/address-book", {
        controller: 'addressBookCtrl',
        templateUrl: 'partials/addressBook.html'
      })
      .when("/404", {
        templateUrl: 'partials/404.html'
      })
      .otherwise({
        redirectTo: '/wallets'
      });

      NotificationProvider.setOptions({
        delay: 3000,
        horizontalSpacing: 60
      });
    });
  }
)();
