var txDefaultOrig =
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "https://mainnet.infura.io:443",
  alertNode: {
    url : "https://alerts.gnosis.pm",
    authCode: null
  },
  connectionChecker:{
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  wallet: "injected",
  // Mainnet
  walletFactoryAddress: "0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e"
};

var txDefault = {
  ethereumNodes : [
    {
      url : "https://mainnet.infura.io:443",
      name: "Mainnet"
    },
    {
      url : "https://ropsten.infura.io:443",
      name: "Ropsten"
    },
    {
      url : "https://kovan.infura.io:443",
      name: "Kovan"
    },
    {
      url : "http://localhost:8545",
      name: "Private node"
    }
  ],
  alertNodes: [
    {
      url: 'https://alerts.gnosis.pm',
      authCode: null
    }
  ],
  walletFactoryAddresses: [
    {
      address: txDefaultOrig.walletFactoryAddress
    }
  ]
};

/**
* Reload configuration
*/
function loadConfiguration () {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));
  Object.assign(txDefault, txDefaultOrig, userConfig);
}

loadConfiguration();
