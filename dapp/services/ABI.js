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
        factory.saved[to.toLowerCase()] = { abi: abi, name: name};

        localStorage.setItem("abis", JSON.stringify(factory.saved));
      };

      factory.remove = function (to) {
        delete factory.saved[to];
        localStorage.setItem("abis", JSON.stringify(factory.saved));
      }

      factory.decode = function (abi, data) {
        var methodIds = {};
        // Generate event id's
        Object.keys(abi).map(function(key){
          var item = abi[key];
          if(item.name){
            var signature = new Web3().sha3(item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")");
            if(item.type == "event"){
              methodIds[signature.slice(2)] = item;
            }
            else{
              methodIds[signature.slice(2, 6)] = item;
            }
          }
        });

        var method = data.slice(2, 6);
        var dataIndex = 10;
        var decodedParams = [];
        if (methodIds[method]) {
          // Iterate params
          methodIds[method].inputs.map(function (param) {
            var decodedP = {
              name: param.name
            };

            var dataEndIndex = dataIndex + 64;
            decodedP.value = "0x" + data.slice(dataIndex, dataEndIndex);
            dataIndex = dataEndIndex;


            if (param.type == "address"){
              decodedP.value = "0x" + new Web3().toBigNumber(decodedP.value).toString(16);
            }
            else if(param.type == "uint256" || param.type == "uint8" || param.type == "int" ){
              decodedP.value = new Web3().toBigNumber(decodedP.value).toString(10);
            }

            decodedParams.push(decodedP);
          });
          return {
            title: methodIds[method].name,
            params: decodedParams
          };
        }
        else {
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
      };

      return factory;
    });
  }
)();
