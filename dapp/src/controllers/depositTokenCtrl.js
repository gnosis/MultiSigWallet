(
  function () {
    angular
    .module("multiSigWeb")
    .controller("depositTokenCtrl", function ($scope, Transaction, Token, $uibModalInstance, Utils, wallet, token) {
      $scope.wallet = wallet;
      $scope.token = token;
      $scope.amount = 10;
      $scope.deposit = function () {
        Token.transfer(
          $scope.token.address,
          $scope.wallet.address,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals),
          {onlySimulate: false},
          function(e, tx){
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
                Utils.notification("Deposit transaction was sent.");
                $uibModalInstance.close();
                Transaction.add({
                  txHash: tx,
                  callback: function () {
                    Utils.success("Deposit transaction was mined.");
                  }
                });
            }
          }
        );
      };

      $scope.simulate = function () {
        Token.transfer(
          $scope.token.address,
          $scope.wallet.address,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals),
          {onlySimulate: true},
          function(e, tx){
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.simulatedTransaction(tx);
            }
          }
        );
      };

      $scope.sign = function () {
        Token.transferOffline(
          $scope.token.address,
          $scope.wallet.address,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals),
          function(e, signed){
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              $uibModalInstance.close();
              Utils.signed(signed);
            }
          }
        );
      };

        $scope.cancel = function () {
          $uibModalInstance.dismiss();
        };
    });
  }
)();
