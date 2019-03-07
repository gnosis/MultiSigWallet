(
  function () {
    angular
    .module("multiSigWeb")
    .service("CommunicationBus", function ($interval) {
      var factory = {
        functions: {},
        intervals: {}
      };

      factory.addFn = function (fn, index) {
        factory.functions[index] = fn;
        return index;
      };

      factory.startInterval = function (index, millis) {
        if (!factory.intervals[index]) {
          factory.intervals[index] = $interval(factory.functions[index], millis);
        }
      };

      factory.stopInterval = function (index) {
        if (factory.intervals[index]) {
          $interval.cancel(factory.intervals[index]);
          delete factory.intervals[index];
        }
      };

      return factory;
    });
  }
)();
