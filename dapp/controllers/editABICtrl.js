(
  function () {
    angular
    .module("multiSigWeb")
    .controller("editABICtrl", function ($scope, to, ABI, cb, Utils, $uibModalInstance) {
      var abis = ABI.get();
      if (abis[to]) {
        $scope.abi = JSON.stringify(abis[to]);
      }
      else {
        $scope.abi = "";
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.ok = function () {
        try {
          var parsedABI = JSON.parse($scope.abi);
          ABI.update(parsedABI, to);
          $uibModalInstance.close();
          cb();
        }
        catch (e) {
          Utils.dangerAlert(e);
        }
      }

    });
  }
)();
