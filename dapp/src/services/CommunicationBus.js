(
  function () {
    angular
    .module("multiSigWeb")
    .service("CommunicationBus", function ($interval) {
      var factory = {
        functions: {},
        intervals: {}
      };

      /**
       * Add a function to the list of available functions.
       * @param fn {Function}
       * @param index {String} - The name of the function normally
       */
      factory.addFn = function (fn, index) {
        factory.functions[index] = fn;
        return index;
      };

      /**
       * Set the Angular $interval for a function at a given index
       * @param index - Function identifier
       * @param millis - Timeout interval in milliseconds
       */
      factory.startInterval = function (index, millis) {
        if (!factory.intervals[index]) {
          factory.intervals[index] = $interval(factory.functions[index], millis);
        }
      };

      /**
       * Stop an existing $interval
       * @param index - Function identifier
       */
      factory.stopInterval = function (index) {
        if (factory.intervals[index]) {
          $interval.cancel(factory.intervals[index]);
          delete factory.intervals[index];
        }
      };

      /**
       * Retrieve a function
       * @param index - Function identifier
       */
      factory.getFn = function (index) {
        return factory.functions[index];
      };

      return factory;
    });
  }
)();
