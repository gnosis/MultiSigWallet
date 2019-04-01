(
  function () {
    angular
    .module('multiSigWeb')
    .service('Connection', function ($rootScope, $interval) {

      var factory = {};
      var isConnected = false;

      var setup = function () {
        // Call it at startup
        factory.checkConnection();
        // Setup interval
        $interval(factory.checkConnection, txDefault.connectionChecker.checkInterval);
      };

      function callDigest() {
        try{
          $rootScope.$digest();
        }catch(error){}
      }

      /**
      * Connection lookup against a defined endpoint
      * Check config.js for the endpoint configuration
      */
      factory.checkConnection = function () {
        factory.isConnected = navigator.onLine; // true | false
        callDigest();
      };

      setup();

      return factory;
    });
  }
)();
