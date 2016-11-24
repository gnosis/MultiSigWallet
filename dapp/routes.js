(
  function(){
    angular
    .module('multiSigWeb')
    .config(function($routeProvider){
      $routeProvider
      .when("/wallets", {
        controller: 'walletCtrl',
        templateUrl: 'partials/wallet.html'
      });
    });
  }
)();
