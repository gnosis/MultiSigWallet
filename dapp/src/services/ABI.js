(
  function () {
    angular
    .module("multiSigWeb")
    .service("ABI", function () {
      var factory = {
        saved: JSON.parse(localStorage.getItem("abis")) || {},
      };

      factory.get = function () {
        return JSON.parse(localStorage.getItem("abis")) || {};
      };

      factory.update = function (abi, to, name) {
        abiDecoder.addABI(abi);
        factory.saved[to] = { abi: abi, name: name};

        localStorage.setItem("abis", JSON.stringify(factory.saved));
      };

      factory.remove = function (to) {
        abiDecoder.removeABI(factory.saved[to].abi);
        delete factory.saved[to];
        localStorage.setItem("abis", JSON.stringify(factory.saved));
      };

      factory.decode = function (data) {
        var decoded = abiDecoder.decodeMethod(data);
        if (!decoded) {
          if (data.length > 20) {
            return {
              title: data.slice(0, 20) + "...",
              notDecoded: true
            };
          }
          else {
            return {
              title: data.slice(0, 20),
              notDecoded: true
            };
          }
        }
        else {
          return {
            title: decoded.name,
            params: decoded.params
          };
        }
      };

      return factory;
    });
  }
)();
