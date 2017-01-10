(
  function () {
    angular
    .module('multiSigWeb')
    .service('Connection', function ($http, $interval) {

      var factory = {};
      var isConnected = false;

      /**
      * Connection lookup against a defined endpoint
      * Check config.js for the endpoint configuration
      */
      function checkConnection() {
        $http({
          method : txDefault.connectionChecker.method,
          url : txDefault.connectionChecker.url,
        }).then(function successCallBack (response) {
          isConnected = true;
        }, function errorCallBack (response) {
          isConnected = false;
        });

        factory.isConnected = isConnected;

      };

      // Setup interval
      $interval(checkConnection, txDefault.connectionChecker.checkInterval);

      return factory;
    });
  }
)();
