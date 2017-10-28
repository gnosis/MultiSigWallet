var txDefaultOrig =
{
  gasLimit: 3141592,
  gasPrice: 18000000000,
  confirmAddGas: 37004,
  path: "44'/60'/0'/0",
  ethereumNode: "https://mainnet.infura.io:443",
  alertNode: {
    url : "https://alerts.gnosis.pm",
    authCode: null,
    name: "Mainnet",
    managementPage: "https://alerts.gnosis.pm/api/alert/manage/?code={auth-code}",
    managementRoute: "api/alert/manage"
  },
  connectionChecker:{
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  wallet: "injected",
  defaultChainID: null,
  // Mainnet
  walletFactoryAddress: "0x12ff9a987c648c5608b2c2a76f58de74a3bf1987",
  ledgerAPI: "http://localhost:" + ledgerPort,
  tokens: [
    {
      'address': '0x6810e776880c02933d47db1b9fc05908e5386b96',
      'name': 'Gnosis',
      'symbol': 'GNO',
      'decimals': 18
    },
    {
      'address': '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
      'name': 'Golem',
      'symbol': 'GNT',
      'decimals': 18
    },
    {
      'address': '0x888666CA69E0f178DED6D75b5726Cee99A87D698',
      'name': 'Iconomi',
      'symbol': 'ICN',
      'decimals': 18
    },
    {
      'address': '0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5',
      'name': 'Augur',
      'symbol': 'REP',
      'decimals': 18
    },
    {
      'address': '0xc66ea802717bfb9833400264dd12c2bceaa34a6d',
      'name': 'Maker',
      'symbol': 'MKR',
      'decimals': 18
    },
    {
      'address': '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a',
      'name': 'Digix Global',
      'symbol': 'DGD',
      'decimals': 9
    },
    {
      'address': '0xAf30D2a7E90d7DC361c8C4585e9BB7D2F6f15bc7',
      'name': 'FirstBlood',
      'symbol': '1ST',
      'decimals': 18
    },
    {
      'address': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      'name': 'Basic Attention Token',
      'symbol': 'BAT',
      'decimals': 18
    },
    {
      'address': '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
      'name': 'Bancor Network',
      'symbol': 'BNT',
      'decimals': 18
    },
    {
      'address': '0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009',
      'name': 'SingularDTV',
      'symbol': 'SNGLS',
      'decimals': 0
    },
    {
      'address': '0x960b236A07cf122663c4303350609A66A7B288C0',
      'name': 'Aragon Network',
      'symbol': 'ANT',
      'decimals': 18
    },
    {
      'address': '0x607F4C5BB672230e8672085532f7e901544a7375',
      'name': 'iExec RLC',
      'symbol': 'RLC',
      'decimals': 9
    },
    {
      'address': '0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1',
      'name': 'Melon',
      'symbol': 'MLN',
      'decimals': 18
    },
    {
      'address': '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
      'name': 'Storjcoin X',
      'symbol': 'SJCX',
      'decimals': 8
    }
  ]
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
  alertNodes: {
    'mainnet': {
      url: 'https://alerts.gnosis.pm',
      authCode: null,
      name: 'Mainnet',
      networkId: 1,
      managementPage: "https://alerts.gnosis.pm/api/alert/manage/?code={auth-code}"
    },
    'kovan': {
      url: 'https://testalerts.gnosis.pm',
      authCode: null,
      name: 'Kovan',
      networkId: 42,
      managementPage: "https://testalerts.gnosis.pm/api/alert/manage/?code={auth-code}"
    }
  },
  etherscanApiKey: '5HX5Z25IG7PGQ7BGCY3DTJ11MS2VE4Y1MK',
  walletFactoryAddresses: {
    'mainnet': {
      name: 'Mainnet',
      address: txDefaultOrig.walletFactoryAddress
    },
    'ropsten': {
      name: 'Ropsten',
      address: '0x5cb85db3e237cac78cbb3fd63e84488cac5bd3dd'
    },
    'kovan': {
      name: 'Kovan',
      address: '0x6C4c60F01999408CfD872Fdcf739912509A15da5'
    },
    'privatenet': {
      name: 'Privatenet',
      address: '0xd79426bcee5b46fde413ededeb38364b3e666097'
    }
  }
};

/**
* Reload configuration
*/
function loadConfiguration () {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));
  Object.assign(txDefault, txDefaultOrig, userConfig);
}

loadConfiguration();
