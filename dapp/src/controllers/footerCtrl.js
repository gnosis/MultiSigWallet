(
    function () {
      angular
      .module('multiSigWeb')
      .controller('footerCtrl', function ($scope) {
        $scope.navCollapsed = true;
        $scope.isElectron = isElectron;

        // electron show terms and policy
        // `shell` is an Electron only command
        $scope.openTerms = function() {
            shell.openExternal(txDefault.websites.wallet + '/TermsofUseMultisig.pdf');
        }

        $scope.openPolicy = function () {
            shell.openExternal(txDefault.websites.gnosis + '/assets/pdf/PrivacyPolicyGnosisLtd.pdf');
        }

        $scope.openImprint = function () {
            shell.openExternal(txDefault.websites.wallet + '/imprint.html');
        }

      });
    }
)();
