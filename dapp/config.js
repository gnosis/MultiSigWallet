var txDefaultOrig =
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "https://mainnet.infura.io:443",
  alertsNode: 'https://alerts.gnosis.pm',
  connectionChecker:{
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  wallet: "injected",
  defaultChainID: null,
  // Mainnet
  walletFactoryAddress: "0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e"
};

var txDefault = {};

/**
* Reload configuration
*/
function loadConfiguration () {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));
  Object.assign(txDefault, txDefaultOrig, userConfig);
}

loadConfiguration();
