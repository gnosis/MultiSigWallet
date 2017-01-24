(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addTokenCtrl", function ($scope, $uibModalInstance, Wallet, Token, token, wallet) {

      $scope.editToken = {}; // Used for editing data
      $scope.token = token;
      Object.assign($scope.editToken, $scope.token);
      $scope.wallet = wallet;

      if (!$scope.wallet.tokens) {
        $scope.wallet.tokens = {};
      }

      // Refresh token info when address changes
      $scope.updateInfo = function () {
        var batchInfo = Wallet.web3.createBatch();

        batchInfo.add(
          Token.name(
            $scope.token.address,
            function (e, name) {
              $scope.token.name = name;
              $scope.$apply();
            }
          )
        );

        batchInfo.add(
          Token.symbol(
            $scope.token.address,
            function (e, symbol) {
              $scope.token.symbol = symbol;
              $scope.$apply();
            }
          )
        );

        batchInfo.add(
          Token.decimals(
            $scope.token.address,
            function (e, decimals) {
              $scope.token.decimals = decimals.toNumber();
              $scope.$apply();
            }
          )
        );

        batchInfo.execute();
      };

      $scope.ok = function () {
        //$scope.wallet.tokens[$scope.token.address] = $scope.token;
        $scope.wallet.tokens[$scope.editToken.address] = $scope.editToken;
        Wallet.updateWallet($scope.wallet);
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
