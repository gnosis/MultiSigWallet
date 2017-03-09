(
  function () {
    angular
    .module("multiSigWeb")
    .service("EthAlerts", function ($http) {

      var factory = {};
      var config = {};
      var host = 'http://localhost:8000/' // move to global config
      var apiPrefix = 'api/'
      var urls = {
        'getAlert' : apiPrefix + 'alert/',
        'create' : apiPrefix + 'alert/',
        'signup' : apiPrefix + 'alert/signup/'
      }

      function getUrl (action) {
        return host + urls[action];
      }

      function addAuthHeaders (data) {
        data.headers = {
          'auth-code': localStorage.getItem('auth-code')
        };
      }

      factory.create = function (data, cb) {
        addAuthHeaders(config);
        return $http.post(getUrl('create'), data, config);
      };

      factory.signup = function (data, cb) {
        return $http.post(getUrl('signup'), data, config);
      };

      factory.get = function (data, cb) {
        addAuthHeaders(data);
        return $http.get(getUrl('getAlert'), data);
      };

      factory.signupCallback = 'https://wallet.gnosis.pm/#/signup{%auth-code%}';


      return factory;
    });
  }
)();
