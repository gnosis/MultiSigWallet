(
  function () {
    angular
    .module("multiSigWeb")
    .controller("removeWalletCtrl", function ($rootScope, $scope, $uibModalInstance, wallet, Wallet, Utils, callback) {

      $scope.wallet = wallet;
      $scope.ok = function () {
        Wallet.removeWallet($scope.wallet.address);
        try{
          $rootScope.wallets = Wallet.getAllWallets();
        }catch(err){
          console.log(err);
        }
        $uibModalInstance.close();
        Utils.success("The wallet was removed successfully.");
        callback();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
