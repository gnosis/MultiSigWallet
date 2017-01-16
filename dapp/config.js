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
  walletFactoryAddress: "0xd79426bcee5b46fde413ededeb38364b3e666097"
  // Ropsten
  // walletFactoryAddress: "0xd3bae58a01c64dc8d6a7a3d20a58975f005b23e1"
};
