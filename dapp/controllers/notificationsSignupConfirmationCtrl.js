(
  function () {
    angular
    .module("multiSigWeb")
    .controller("notificationsSignupConfirmationCtrl", function ($rootScope, $scope, $routeParams, $window) {

      function init() {
        if ($routeParams['auth-code']) {
          var config = Object.assign({}, JSON.parse(localStorage.getItem("userConfig")));
          config.authCode = $routeParams['auth-code'];
          localStorage.setItem("userConfig", JSON.stringify(config));
          localStorage.setItem("show-signup-success", true);
          $window.location.href = '/';
        }
      }

      init();

    });
  }
)();
