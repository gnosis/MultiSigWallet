(
  function () {
    angular
    .module("multiSigWeb")
    .controller("nonceCtrl", function (Web3Service, $scope, Utils, $uibModal, $uibModalInstance) {

      $scope.ok = function () {
        Web3Service.web3.eth.getTransactionCount(
          $scope.address,
          function (e, count) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              // Close 1st getNonce modal
              $uibModalInstance.dismiss();

              $uibModal.open({
                animation: false,
                templateUrl: 'partials/modals/showNonce.html',
                size: 'md',
                controller: function ($scope, $uibModalInstance, Utils) {
                  $scope.nonce = count;

                  $scope.copy = function () {
                    Utils.success("Nonce has been copied to clipboard.");
                    $uibModalInstance.dismiss();
                  };

                  $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                  };

                }
              });
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
