(
  function () {
    angular
    .module('multiSigWeb')
    .controller('navCtrl', function ($scope, Wallet, Connection, $interval, $sce) {
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
      $scope.statusIcon = $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i>');

      $scope.updateConnectionStatus = function () {
        $scope.connectionStatus = Connection.isConnected;
        $scope.statusIcon = Connection.isConnected ? $sce.trustAsHtml('Online <i class=\'fa fa-circle online-status\' aria-hidden=\'true\'></i>') : $sce.trustAsHtml('<i class=\'fa fa-refresh fa-spin fa-fw\' aria-hidden=\'true\'></i> Offline <i class=\'fa fa-circle offline-status\' aria-hidden=\'true\'></i>');
      };

      Wallet.webInitialized.then(
        function () {
          $scope.interval = $interval($scope.updateInfo, 15000);
          $scope.updateInfo();

          /**
          * Lookup connection status
          * Check connectivity first on page loading
          * and then at time interval
          */
          Connection.checkConnection();
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
