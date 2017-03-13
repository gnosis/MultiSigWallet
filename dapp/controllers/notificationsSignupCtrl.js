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

      $scope.ok = function () {

        EthAlerts.signup($scope.request).then(
          function successCallback(response) {
            $uibModalInstance.close();
            callback();
            Utils.success(
              "Signup succeeded. An email was sent to " +
              $scope.request.email +
              ". Check your inbox and follow the instructions contained in it."
            );
          },
          function errorCallback(response) {
            var errorMessage = "";
            if (response.status = -1) {
              errorMessage = 'An error occurred. Please verify whether Gnosis Alert Node is setted correctly.';
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
        );
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };

    });
  }
)();
