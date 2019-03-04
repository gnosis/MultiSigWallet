(
  function () {
    angular
    .module("multiSigWeb")
    .service("EthAlerts", function ($http, $window) {

      var factory = {};
      var config = {};
      var host;
      var apiPrefix = 'api/';
      var urls = {
        'getAlert' : apiPrefix + 'alert/',
        'create' : apiPrefix + 'alert/',
        'signup' : apiPrefix + 'alert/signup/',
        'delete' : apiPrefix + 'alert/'
      };

      function getUrl (action) {
        host = txDefault.alertNode.url;
        return host + (host.endsWith('/') ? urls[action] : '/' + urls[action]);
      }

      function addAuthHeaders (data) {
        data.headers = {
          'auth-code': txDefault.alertNode.authCode
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

      factory.delete = function (cb) {
        var data = {};
        addAuthHeaders(data);
        return $http.delete(getUrl('delete'), data);
      };

      factory.signupCallback = !isElectron ? $window.location.origin + '#/signup/?auth-code={%auth-code%}' : null;


      return factory;
    });
  }
)();
