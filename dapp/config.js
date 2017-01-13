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
  //walletFactoryAddress: "0xc718d479dea0204e924e448e27fa4e216e743fc3"
  walletFactoryAddress: "0xd3bae58a01c64dc8d6a7a3d20a58975f005b23e1"
};
