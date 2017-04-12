(
  function () {
    angular
    .module("multiSigWeb")
    .service("Config", function () {
      var factory = {
        updates: 0
      };

      factory.getConfiguration = function () {
        return Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));
      };

      factory.setConfiguration = function (value) {
        localStorage.setItem("userConfig", value);
        this.updates++;
      };

      factory.removeConfiguration = function (value) {
        localStorage.removeItem("userConfig");
        this.updates++;
      };

      return factory;
    });
  }
)();
