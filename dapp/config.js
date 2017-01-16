var txDefault =
JSON.parse(localStorage.getItem("config")) ||
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "http://localhost:8545",
  connectionChecker:{
    method : "OPTIONS",
    url : "http://status.gnosis.pm",
    checkInterval: 10000
  },
  // Testrpc
  walletFactoryAddress: "0xa921c298ccce305f3edb7ab4a8a8e5d98b1eadad"
  // Ropsten
  // walletFactoryAddress: "0xd3bae58a01c64dc8d6a7a3d20a58975f005b23e1"
};
