(
  function () {
    angular
    .module("multiSigWeb")
    .service("Config", function () {
      var factory = {
        updates: 0
      };

      factory.getUserConfiguration = function () {
        return Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig")));
      };

      factory.getConfiguration = function (key) {
        return JSON.parse(localStorage.getItem(key));
      };

      factory.setConfiguration = function (key, value) {
        localStorage.setItem(key, value);
        this.triggerUpdates();
      };

      factory.removeConfiguration = function (key) {
        localStorage.removeItem(key);
        this.triggerUpdates();
      };

      factory.triggerUpdates = function () {
        this.updates++;
      };

      return factory;
    });
  }
)();
