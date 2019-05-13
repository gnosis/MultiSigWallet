(
    function () {
      angular
      .module('multiSigWeb')
      .controller('footerCtrl', function ($scope, Utils) {
        $scope.navCollapsed = true;

        // electron show terms and policy
        // `shell` is an Electron only command
        $scope.openTerms = function() {
          Utils.openResource(txDefault.resources.termsOfUse);
        }

        $scope.openPolicy = function () {
          Utils.openResource(txDefault.resources.privacyPolicy);
        }

        $scope.openImprint = function () {
          Utils.openResource(txDefault.resources.imprint);
        }

      });
    }
)();
