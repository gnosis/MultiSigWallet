(
  function(){
    angular
    .module("multiSigWeb")
    .controller("signOfflineCtrl", function($scope, Wallet, Utils, Transaction, wallet, $uibModalInstance){

      $scope.ok = function(){
        $uibModalInstance.close($scope.nonce);
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
