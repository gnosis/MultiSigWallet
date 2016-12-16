(
  function(){
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function($scope, Wallet, $interval){
      $scope.navCollapsed = true;

      $scope.loggedIn = Wallet.web3;

      $scope.updateInfo = function(){
        Wallet.initParams().then(function(params){
          $scope.accounts = Wallet.accounts;
          $scope.nonce = Wallet.txParams.nonce;
          $scope.balance = Wallet.balance;
        });
      }

      $scope.interval = $interval($scope.updateInfo, 15000);


      $scope.$on('$destroy', function(){
        $interval.cancel($scope.interval);
      });

      $scope.selectAccount = function(account){
        Wallet.selectAccount(account);
        $scope.updateInfo();
      }

      $scope.updateInfo();



    });
  }
)();
