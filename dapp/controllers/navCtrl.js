(
  function () {
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function ($scope, Wallet, Connection, $interval) {
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

      /**
      * Updates connection status
      */
      $scope.updateConnectionStatus = function (){
        $scope.connectionStatus = Connection.isConnected;
      };

      Wallet.webInitialized.then(
        function () {
          $scope.interval = $interval($scope.updateInfo, 15000);
          $scope.updateInfo();

          /**
          * Lookup connection status
          */
          $scope.updateConnectionStatus();
          $scope.connectionInterval = $interval($scope.updateConnectionStatus, txDefault.connectionChecker.checkInterval);
        }
      );

      $scope.$on('$destroy', function () {
        $interval.cancel($scope.interval);
      });

      $scope.selectAccount = function (account) {
        Wallet.selectAccount(account);
        $scope.updateInfo();
      };
    });
  }
)();
