(
  function () {
    angular
    .module("multiSigWeb")
    .controller("notificationsSignupConfirmationCtrl", function ($rootScope, $scope, $routeParams, $window) {

      function init() {
        if ($routeParams['auth-code']) {
          localStorage.setItem("auth-code", $routeParams['auth-code']);
          localStorage.setItem("show-signup-success", true);
          $window.location.href = '/index.html';          
        }
      }

      init();

    });
  }
)();
