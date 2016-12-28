var txDefault =
JSON.parse(localStorage.getItem("config")) ||
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "http://localhost:8545"
}
