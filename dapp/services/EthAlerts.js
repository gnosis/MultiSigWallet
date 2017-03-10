(
  function () {
    angular
    .module("multiSigWeb")
    .service("EthAlerts", function ($http, $window) {

      var factory = {};
      var config = {};
      var host = JSON.parse(localStorage.getItem("userConfig")).alertsNode;
      var apiPrefix = 'api/'
      var urls = {
        'getAlert' : apiPrefix + 'alert/',
        'create' : apiPrefix + 'alert/',
        'signup' : apiPrefix + 'alert/signup/'
      }

      function getUrl (action) {
        return host + (host.endsWith('/') ? urls[action] : '/' + urls[action]);
      }

      function addAuthHeaders (data) {
        data.headers = {
          'auth-code': JSON.parse(localStorage.getItem("userConfig")).authCode
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

      factory.signupCallback = $window.location.origin + '#/signup{%auth-code%}';


      return factory;
    });
  }
)();
