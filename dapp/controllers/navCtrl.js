(
  function () {
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function ($scope, Wallet, $interval) {
      $scope.navCollapsed = true;

      $scope.updateInfo = function (){
        Wallet.initParams().then(function () {
          $scope.loggedIn = Wallet.web3;
          $scope.accounts = Wallet.accounts;
          $scope.coinbase = Wallet.coinbase;
          $scope.nonce = Wallet.txParams.nonce;
          $scope.balance = Wallet.balance;
        });
      };

      Wallet.webInitialized.then(
        function () {
          $scope.interval = $interval($scope.updateInfo, 15000);
          $scope.updateInfo();
        }
      );

      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
      });

      $scope.selectAccount = function (account) {
        Wallet.selectAccount(account);
        $scope.updateInfo();
      }
    });
  }
)();
