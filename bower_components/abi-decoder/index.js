const SolidityCoder = require("web3/lib/solidity/coder.js");
const Web3 = require('web3');

const state = {
  savedABIs : [],
  methodIDs: {}
}

function _getABIs() {
  return state.savedABIs;
}

function _addABI(abiArray) {
  if (Array.isArray(abiArray)) {

    // Iterate new abi to generate method id's
    abiArray.map((abi) => {
      if(abi.name){
        const signature = new Web3().sha3(abi.name + "(" + abi.inputs.map(function(input) {return input.type;}).join(",") + ")");
        if(abi.type == "event"){
          state.methodIDs[signature.slice(2)] = abi;
        }
        else{
          state.methodIDs[signature.slice(2, 10)] = abi;
        }
      }
    });

    state.savedABIs = state.savedABIs.concat(abiArray);
  }
  else {
    throw new Error("Expected ABI array, got " + typeof abiArray);
  }
}

function _removeABI(abiArray) {
  if (Array.isArray(abiArray)) {

    // Iterate new abi to generate method id's
    abiArray.map((abi) => {
      if(abi.name){
        const signature = new Web3().sha3(abi.name + "(" + abi.inputs.map(function(input) {return input.type;}).join(",") + ")");
        if(abi.type == "event"){
          if (state.methodIDs[signature.slice(2)]) {
            delete state.methodIDs[signature.slice(2)];
          }
        }
        else{
          if (state.methodIDs[signature.slice(2, 10)]) {
            delete state.methodIDs[signature.slice(2, 10)];
          }
        }
      }
    });
  }
  else {
    throw new Error("Expected ABI array, got " + typeof abiArray);
  }
}

function _getMethodIDs() {
  return state.methodIDs;
}

function _decodeMethod(data) {
  const methodID = data.slice(2, 10);
  const abiItem = state.methodIDs[methodID];
  if (abiItem) {
    const params = abiItem.inputs.map((item) => item.type);
    let decoded = SolidityCoder.decodeParams(params, data.slice(10));
    return {
      name: abiItem.name,
      params: decoded.map((param, index) => {
        let parsedParam = param;
        if (abiItem.inputs[index].type.indexOf("uint") !== -1) {
          parsedParam = new Web3().toBigNumber(param).toString();
        }
        return {
          name: abiItem.inputs[index].name,
          value: parsedParam,
          type: abiItem.inputs[index].type
        };
      })
    }
  }
}

function padZeros (address) {
  var formatted = address;
  if (address.indexOf('0x') != -1) {
    formatted = address.slice(2);
  }

  if (formatted.length < 40) {
    while (formatted.length < 40) formatted = "0" + formatted;
  }

  return "0x" + formatted;
};

function _decodeLogs(logs) {
  return logs.map((logItem) => {
    const methodID = logItem.topics[0].slice(2);
    const method = state.methodIDs[methodID];
    if (method) {
      const logData = logItem.data;
      let decodedParams = [];
      let dataIndex = 0;
      let topicsIndex = 1;

      let dataTypes = [];
      method.inputs.map(
        (input) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        }
      );
      const decodedData = SolidityCoder.decodeParams(dataTypes, logData.slice(2));
      // Loop topic and data to get the params
      method.inputs.map(function (param) {
        var decodedP = {
          name: param.name,
          type: param.type
        };

        if (param.indexed) {
          decodedP.value = logItem.topics[topicsIndex];
          topicsIndex++;
        }
        else {
          decodedP.value = decodedData[dataIndex];
          dataIndex++;
        }

        if (param.type == "address"){
          decodedP.value = padZeros(new Web3().toBigNumber(decodedP.value).toString(16));
        }
        else if(param.type == "uint256" || param.type == "uint8" || param.type == "int" ){
          decodedP.value = new Web3().toBigNumber(decodedP.value).toString(10);
        }

        decodedParams.push(decodedP);
      });


      return {
        name: method.name,
        events: decodedParams,
        address: logItem.address
      };
    }
  });
}

module.exports = {
  getABIs: _getABIs,
  addABI: _addABI,
  getMethodIDs: _getMethodIDs,
  decodeMethod: _decodeMethod,
  decodeLogs: _decodeLogs,
  removeABI: _removeABI
};
