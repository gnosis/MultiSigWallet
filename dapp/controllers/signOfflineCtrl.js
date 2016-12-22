(
  function(){
    angular
    .module("multiSigWeb")
    .controller("signOfflineCtrl", function($scope, Wallet, Utils, Transaction, $uibModalInstance){

      $scope.ok = function(){
        $uibModalInstance.close($scope.nonce);
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss("User rejected to sign transaction");
      };

    });
  }
)();
