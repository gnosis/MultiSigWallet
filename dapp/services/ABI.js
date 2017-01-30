(
  function () {
    angular
    .module("multiSigWeb")
    .service("ABI", function (Wallet) {
      var factory = {
        saved: JSON.parse(localStorage.getItem("abis")) || {},
      };

      factory.get = function () {
        return JSON.parse(localStorage.getItem("abis")) || {};
      };

      factory.update = function (abi, to) {
        factory.saved[to] = abi;

        localStorage.setItem("abis", JSON.stringify(factory.saved));
      };

      return factory;
    });
  }
)();
