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
        var executeChanges = true;
        var remove = false;

        try {
          if ($scope.abi !== undefined && $scope.abi.length > 0) {
              var parsedABI = JSON.parse($scope.abi);
          }
          else {
            remove = true;
          }
        }
        catch (e) {
          Utils.dangerAlert(e);
          executeChanges = false;
        }

        if (executeChanges) {
          if (remove) {
            if ($scope.name) {
              ABI.update(undefined, to, $scope.name);
            }
            else {
              ABI.remove(to);
            }
          }
          else {
            ABI.update(parsedABI, to, $scope.name);
          }

          $uibModalInstance.close();
          cb();

        }
      };

    });
  }
)();
