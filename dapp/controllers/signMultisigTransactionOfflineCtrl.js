(
  function(){
    angular
    .module("multiSigWeb")
    .controller("signMultisigTransactionOfflineCtrl", function($scope, Wallet, Utils, Transaction, $uibModalInstance){

      $scope.ok = function(){
        $uibModalInstance.close($scope.nonce);
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
