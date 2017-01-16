(
  function () {
    angular
    .module('multiSigWeb')
    .service('Connection', function ($rootScope, $http, $interval) {

      var factory = {};
      var isConnected = true;

      var setup = function() {
        // Call it at startup
        factory.checkConnection();
        // Setup interval
        $interval(factory.checkConnection, txDefault.connectionChecker.checkInterval);
      }

      /**
      * Connection lookup against a defined endpoint
      * Check config.js for the endpoint configuration
      */

      factory.checkConnection = function() {
        $http({
          method : txDefault.connectionChecker.method,
          url : txDefault.connectionChecker.url,
        })
        .then(function successCallBack (response) {
            isConnected = false;
          }, function errorCallBack (response) {
            isConnected = false;
          }
        );

        factory.isConnected = isConnected;

        try{
          $rootScope.$digest();
        }catch(error){}

      };

      setup();

      return factory;
    });
  }
)();
