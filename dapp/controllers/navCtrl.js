(
  function(){
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function($scope, Wallet){
      $scope.navCollapsed = true;

      $scope.loggedIn = Wallet.web3;

      $scope.updateInfo = function(){
        Wallet.updateAccounts(function(e, accounts){
          $scope.accounts = accounts;          

          Wallet.web3.eth.getTransactionCount(accounts[0], function(e, count){
            $scope.nonce = count;
            $scope.connected = Wallet.web3.isConnected();
            $scope.$apply();
            setTimeout($scope.updateInfo, 15000);

          });
        });
      }

      $scope.updateInfo();



    });
  }
)();
