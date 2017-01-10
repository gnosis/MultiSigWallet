(
  function () {
    angular
    .module("multiSigWeb")
    .controller("depositTokenCtrl", function ($scope, Transaction, Token, $routeParams, $uibModalInstance, Wallet, Utils, wallet, token) {
      $scope.wallet = wallet;
      $scope.token = token;
      $scope.amount = 10;
      $scope.deposit = function () {
        Token.transfer(
          $scope.token.address,
          $scope.wallet.address,
          new EthJS.BN(new Web3().toWei($scope.amount)),
          function(e, tx){
            Utils.notification("Deposit transaction was sent.");
            $uibModalInstance.close();
            Transaction.add({
              txHash: tx,
              callback: function () {
                Utils.success("Deposit transaction was mined.");
              }
            });
          }
        );
      };

      $scope.sign = function () {
        Token.transferOffline(
          $scope.token.address,
          $scope.wallet.address,
          new EthJS.BN(new Web3().toWei($scope.amount)),
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
