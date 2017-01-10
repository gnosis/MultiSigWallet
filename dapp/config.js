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
  }
};
