(
  function () {
    angular
    .module('multiSigWeb')
    .service('Connection', function ($rootScope, $http, $interval) {

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
        /*$http({
          method : txDefault.connectionChecker.method,
          url : txDefault.connectionChecker.url,
        })
        .then(function successCallBack (response) {
            factory.isConnected = true;
            callDigest();
          }, function errorCallBack (response) {
            factory.isConnected = false;
            callDigest();
          }
        );*/
        factory.isConnected = navigator.onLine; // true|false
        callDigest();

      };

      setup();

      return factory;
    });
  }
)();
