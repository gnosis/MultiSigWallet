(
  function () {
    angular
    .module("multiSigWeb")
    .controller("notificationsSignupCtrl", function ($rootScope, $scope, $uibModalInstance, wallet, EthAlerts, Utils, callback) {

      $scope.request = {
        'email' : '',
        'name' : 'Multisig',
        'callback' : EthAlerts.signupCallback
      };

      $scope.showLoadingSpinner = false;

      $scope.ok = function () {
        $scope.showLoadingSpinner = true;

        EthAlerts.signup($scope.request).then(
          function successCallback(response) {
            $uibModalInstance.close();
            callback();
            Utils.success(
              "Signup succeeded. An email was sent to " +
              $scope.request.email +
              ". Check your inbox and follow the instructions."
            );
          },
          function errorCallback(response) {
            var errorMessage = "";
            if (response.status = -1) {
              errorMessage = 'An error occurred. Please verify the Alert node settings.';
            }
            else {
              Object.keys(response.data).map(function (error) {
                errorMessage += "<b>" + error + "</b>: ";
                errorMessage += response.data[error];
                errorMessage += "<br/>";
              });
            }
            Utils.dangerAlert(errorMessage);
          }
        )
        .finally(function () {
          $scope.showLoadingSpinner = false;
        });
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
