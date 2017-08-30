(
  function () {
    angular
    .module('multiSigWeb')
    .config(function($routeProvider){
      $routeProvider
      .when("/", {
        controller: 'walletDetailCtrl',
        templateUrl: 'partials/wallet.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    });
  }
)();
