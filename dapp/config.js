var txDefaultOrig =
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "https://mainnet.infura.io:443",
  alertNode: {
    url : "https://alerts.gnosis.pm",
    authCode: null,
    name: "Mainnet",
    managementPage: "https://alerts.gnosis.pm/api/alert/manage/?code={auth-code}"
  },
  connectionChecker:{
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  wallet: "injected",
  defaultChainID: null,
  // Mainnet
  walletFactoryAddress: "0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e",
  ledgerAPI: "http://localhost:8080"
};

if (isElectron) {
  txDefaultOrig.wallet = "remotenode";
}

var txDefault = {
  ethereumNodes : [
    {
      url : "https://mainnet.infura.io:443",
      name: "Remote Mainnet"
    },
    {
      url : "https://ropsten.infura.io:443",
      name: "Remote Ropsten"
    },
    {
      url : "https://kovan.infura.io:443",
      name: "Remote Kovan"
    },
    {
      url : "http://localhost:8545",
      name: "Local node"
    }
  ],
  alertNodes: [
    {
      url: 'https://alerts.gnosis.pm',
      authCode: null,
      name: 'Mainnet',
      managementPage: "https://alerts.gnosis.pm/api/alert/manage/?code={auth-code}"
    },
    {
      url: 'https://testalerts.gnosis.pm',
      authCode: null,
      name: 'Kovan',
      managementPage: "https://testalerts.gnosis.pm/api/alert/manage/?code={auth-code}"
    }
  ],
  walletFactoryAddresses: [
    {
      name: 'Mainnet',
      address: txDefaultOrig.walletFactoryAddress
    },
    {
      name: 'Ropsten',
      address: '0x5cb85db3e237cac78cbb3fd63e84488cac5bd3dd'
    },
    {
      name: 'Kovan',
      address: '0xa0dbdadcbcc540be9bf4e9a812035eb1289dad73'
    },
    {
      name: 'Privatenet',
      address: '0xd79426bcee5b46fde413ededeb38364b3e666097'
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
