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
            Object.keys(response.data).map(function (error) {
              errorMessage += "<b>" + error + "</b>: ";
              errorMessage += response.data[error];
              errorMessage += "<br/>";
            });
            //callback();
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
