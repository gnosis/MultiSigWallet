(
  function () {
    angular
    .module("multiSigWeb")
    .controller("notificationsSignupConfirmationCtrl", function ($rootScope, $scope, $routeParams, $window) {

      function init() {
        if ($routeParams['auth-code']) {
          var config = Object.assign(txDefault, JSON.parse(localStorage.getItem("userConfig")));
          config.alertNode = config.alertNode || {};
          config.alertNode.authCode = $routeParams['auth-code'];
          localStorage.setItem("userConfig", JSON.stringify(config));
          localStorage.setItem("show-signup-success", true);
          loadConfiguration(); // config.js
          $window.location.href = '/';
        }
      }

      init();

    });
  }
)();
