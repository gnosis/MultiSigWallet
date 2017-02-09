(
  function () {
    angular
    .module("multiSigWeb")
    .controller("editABICtrl", function ($scope, to, ABI, cb, Utils, $uibModalInstance) {
      var abis = ABI.get();
      if (abis[to]) {
        var abiObject = abis[to];
        $scope.abi = JSON.stringify(abiObject.abi);
        $scope.name = abiObject.name;
      }
      else {
        $scope.abi = "";
        $scope.name = "";
      }

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.ok = function () {
        try {
          var parsedABI = JSON.parse($scope.abi);
          ABI.update(parsedABI, to, $scope.name);
          $uibModalInstance.close();
          cb();
        }
        catch (e) {
          Utils.dangerAlert(e);
        }
      };

    });
  }
)();
