(
  function(){
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function($scope, Wallet){
      $scope.navCollapsed = true;

      $scope.loggedIn = Wallet.web3;

      $scope.updateInfo = function(){
        Wallet.initParams.then(function(params){
          $scope.accounts = Wallet.accounts;
          $scope.nonce = Wallet.txParams.nonce;
          setTimeout($scope.updateInfo, 15000);
        });
      }

      $scope.updateInfo();



    });
  }
)();
