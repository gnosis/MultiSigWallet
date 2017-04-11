(
  function () {
    angular
    .module('multiSigWeb')
    .controller('accountCtrl', function ($rootScope, $scope, LightWallet, $uibModal, Utils) {

      $scope.account = {};

      /**
      * Init function
      */
      function init (seed=null, keystore=null) {

        if (keystore) {
          // Restore data
          LightWallet.restore();
        }

        $scope.keystore = !keystore ? LightWallet.getKeystore() : keystore;
        $scope.hasKeystore = $scope.keystore ? true : false;
        $scope.account.seed = seed;
        $scope.account.addresses = LightWallet.addresses;
        $scope.hasSeed = $scope.account.seed ? true : false;
      }

      init(null, LightWallet.getKeystore());

      /**
      * Create seed
      */
      $scope.createSeed = function () {
        $scope.account.seed = lightwallet.keystore.generateRandomSeed();
        $scope.hasSeed = true;
      };

      /**
      * Create wallet/account
      */
      $scope.createWallet = function () {
        try{
          LightWallet.create($scope.account.password, $scope.account.seed, function () {
            init();
          });
        }
        catch (err) {
          Utils.dangerAlert(err);
        }
      };

      /**
      * Restore account from seed
      */
      $scope.restoreFromSeed = function () {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/restoreSeed.html',
          size: 'md',
          controller: function ($scope, $uibModalInstance) {

            $scope.ok = function () {
              // Restore
              var isSeedValid = LightWallet.isSeedValid($scope.seed);
              if (isSeedValid) {
                $uibModalInstance.close($scope.seed);
              }
              else {
                Utils.dangerAlert({message:'Invalid seed phrase.'})
              }
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(
          function (seed) {
            init(seed);
            //$scope.account.seed = seed;
          }
        );

      };

      /**
      * Download keystore
      */
      $scope.downloadKeystore = function () {
        var blob = new Blob([LightWallet.getKeystore()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "lightwallet.txt");
      };

      /**
      * Upload keystore
      */
      $scope.uploadKeystore = function (element) {
        var reader = new FileReader();

        reader.onload = function() {
          var text = reader.result;
          try {
            LightWallet.setKeystore(text);
            // Restore data from keystore
            LightWallet.restore();
            init();
          }
          catch (err) {

          }
        };

        var file = element.files[0];
        reader.readAsText(file);
      };

    });
  }
)();
