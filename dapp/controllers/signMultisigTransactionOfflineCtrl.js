(
  function () {
    angular
    .module("multiSigWeb")
    .controller("signMultisigTransactionOfflineCtrl", function ($scope, Wallet, Utils, Transaction, $uibModalInstance) {

      $scope.ok = function () {
        $uibModalInstance.close($scope.nonces);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss("User rejected to sign transaction");
      };

    });
  }
)();
