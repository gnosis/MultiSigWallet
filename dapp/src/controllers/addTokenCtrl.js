(
  function () {
    angular
    .module("multiSigWeb")
    .controller("addTokenCtrl", function (Web3Service, $scope, $uibModalInstance, Wallet, Token, token, wallet) {

      $scope.wallet = wallet;

      if (!$scope.wallet.tokens) {
        $scope.wallet.tokens = {};
      }

      if (Object.keys(token).length) {
        $scope.editMode = true;
        token.address = Web3Service.toChecksumAddress(token.address);
      }

      $scope.editToken = {}; // Used for editing data
      $scope.token = token;
      Object.assign($scope.editToken, $scope.token);

      // Refresh token info when address changes
      $scope.updateInfo = function () {
        var batchInfo = Web3Service.web3.createBatch();

        batchInfo.add(
          Token.name(
            $scope.editToken.address,
            function (e, name) {
              if (!e) {
                $scope.editToken.name = name;
                $scope.$apply();
              }
            }
          )
        );

        batchInfo.add(
          Token.symbol(
            $scope.editToken.address,
            function (e, symbol) {
              if (!e) {
                $scope.editToken.symbol = symbol;
                $scope.$apply();
              }
            }
          )
        );

        batchInfo.add(
          Token.decimals(
            $scope.editToken.address,
            function (e, decimals) {
              if (!e) {
                $scope.editToken.decimals = decimals.toNumber();
                $scope.$apply();
              }
            }
          )
        );

        batchInfo.execute();
      };

      $scope.ok = function () {
        // Convert token address to checksum address
        $scope.editToken.address = Web3Service.toChecksumAddress($scope.editToken.address);
        
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
