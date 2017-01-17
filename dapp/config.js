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
  walletFactoryAddress: "0x34634e55cb3fb8742ef4cfd2286ac916c921aded"
  // Ropsten
  // walletFactoryAddress: "0xd3bae58a01c64dc8d6a7a3d20a58975f005b23e1"
};
