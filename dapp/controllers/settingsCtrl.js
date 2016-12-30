(
  function () {
    angular
    .module("multiSigWeb")
    .controller("settingsCtrl", function ($scope, Wallet, Utils, $window) {
      $scope.config = Object.assign({}, txDefault);

      $scope.update = function () {
        localStorage.setItem("config", JSON.stringify($scope.config));

        if (!$window.web3) {
          Wallet.web3 = new Web3($scope.config.ethereumNode);
        }

        Utils.success("Updated");
      };
    });
  }
)();
