(
    function () {
      angular
      .module('multiSigWeb')
      .controller('footerCtrl', function ($scope) {
        $scope.navCollapsed = true;
        $scope.isElectron = isElectron;

        // electron show terms and policy
        $scope.openTerms = function() {
            shell.openExternal('https://wallet.gnosis.pm/TermsofUseMultisig.pdf');
        }

        $scope.openPolicy = function () {
            shell.openExternal('https://gnosis.pm/assets/pdf/PrivacyPolicyGnosisLtd.pdf');
        }

        $scope.openImprint = function () {
            shell.openExternal('https://wallet.gnosis.pm/imprint.html');
        }

      });
    }
)();
