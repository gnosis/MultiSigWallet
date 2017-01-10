(
  function () {
    angular
    .module("multiSigWeb")
    .controller("withdrawTokenCtrl", function ($scope, Wallet, Token, Transaction, Utils, wallet, token, $uibModalInstance) {

      $scope.wallet = wallet;
      $scope.token = token;
      $scope.value = 0;
      $scope.to = Wallet.coinbase;

      $scope.send = function () {
        Token.withdraw(
          $scope.token.address,
          $scope.wallet.address,
          $scope.to,
          new Web3().toBigNumber($scope.value).mul('1e' + $scope.token.decimals),
          function (e, tx) {
            Utils.notification("Withdraw token transaction was sent.");
            $uibModalInstance.close();
            Transaction.add({
              txHash: tx,
              callback: function () {
                Utils.success("Withdraw token transaction was mined.");
              }
            });
          }
        );
      };

      $scope.signOff = function () {
        Token.withdrawOffline(
          $scope.token.address,
          $scope.wallet.address,
          $scope.to,
          new Web3().toBigNumber($scope.value).mul('1e' + $scope.token.decimals),
          function (e, signed) {
            $uibModalInstance.close();
            Utils.signed(signed);
          }
        );
      };

      $scope.getNonce = function () {
        var value = new Web3().toBigNumber($scope.value).mul('1e' + $scope.token.decimals);
        var data = Token.withdrawData(
          $scope.token.address,
          $scope.to,
          new Web3().toBigNumber($scope.value).mul('1e' + $scope.token.decimals)
        );
        console.log(data);
        Wallet.getNonce($scope.wallet.address, $scope.to, "0x0", data, function (e, nonce) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            Utils.nonce(nonce);
          }
        }).call();

      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
