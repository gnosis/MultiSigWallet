(
  function () {
    angular
    .module("multiSigWeb")
    .service("EthAlerts", function ($http) {

      var factory = {};
      var config = {};
      var host = 'http://localhost:8000/' // move to global config
      var urls = {
        'create' : 'api/alert/',
      }

      function getUrl (action) {
        return host + urls[action];
      }

      factory.create = function (data, cb) {
        return $http.post(getUrl('create'), data, config);
      };


      return factory;
    });
  }
)();
