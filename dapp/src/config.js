var txDefaultOrig =
{
  websites: {
    "wallet": "https://wallet.gnosis.pm",
    "gnosis": "https://gnosis.pm",
    "ethGasStation": "https://safe-relay.gnosis.pm/api/v1/gas-station/"
  },
  gasLimit: 3141592,
  gasPrice: 18000000000,
  ethereumNode: "https://mainnet.infura.io:443",
  connectionChecker: {
    method : "OPTIONS",
    url : "https://www.google.com",
    checkInterval: 5000
  },
  accountsChecker: {
    checkInterval: 5000
  },
  transactionChecker: {
    checkInterval: 15000
  },
  wallet: "injected",
  defaultChainID: null,
  // Mainnet
  walletFactoryAddress: "0x6e95c8e8557abc08b46f3c347ba06f8dc012763f",
  tokens: [
    {
      'address': '0x6810e776880c02933d47db1b9fc05908e5386b96',
      'name': 'Gnosis',
      'symbol': 'GNO',
      'decimals': 18
    },
    {
      'address': '0x960b236A07cf122663c4303350609A66A7B288C0',
      'name': 'Aragon Network',
      'symbol': 'ANT',
      'decimals': 18
    },
    {
      'address': '0x48c80F1f4D53D5951e5D5438B54Cba84f29F32a5',
      'name': 'Augur',
      'symbol': 'REP',
      'decimals': 18
    },
    {
      'address': '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
      'name': 'Bancor Network',
      'symbol': 'BNT',
      'decimals': 18
    },
    {
      'address': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
      'name': 'Basic Attention Token',
      'symbol': 'BAT',
      'decimals': 18
    },
    {
      'address': '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
      'name': 'DAI Stable Coin',
      'symbol': 'DAI',
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
      'address': '0x607F4C5BB672230e8672085532f7e901544a7375',
      'name': 'iExec RLC',
      'symbol': 'RLC',
      'decimals': 9
    },
    {
      'address': '0xc66ea802717bfb9833400264dd12c2bceaa34a6d',
      'name': 'Maker',
      'symbol': 'MKR',
      'decimals': 18
    },
    {
      'address': '0xBEB9eF514a379B997e0798FDcC901Ee474B6D9A1',
      'name': 'Melon',
      'symbol': 'MLN',
      'decimals': 18
    },
    {
      'address': '0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009',
      'name': 'SingularDTV',
      'symbol': 'SNGLS',
      'decimals': 0
    },
    {
      'address': '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
      'name': 'Storjcoin X',
      'symbol': 'SJCX',
      'decimals': 8
    },
    {
      'address': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      'name': 'Wrapped Ether',
      'symbol': 'WETH',
      'decimals': 18
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
      url : "https://rinkeby.infura.io:443",
      name: "Remote Rinkeby"
    },
    {
      url : "http://localhost:8545",
      name: "Local node"
    }
  ],
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
      address: '0x2c992817e0152a65937527b774c7a99a84603045'
    },
    'rinkeby': {
      name: 'Rinkeby',
      address: '0x19ba60816abca236baa096105df09260a4791418'
    },
    'privatenet': {
      name: 'Privatenet',
      address: '0xd79426bcee5b46fde413ededeb38364b3e666097'
    }
  }
};

var oldWalletFactoryAddresses = [
  ("0x12ff9a987c648c5608b2c2a76f58de74a3bf1987").toLowerCase(),
  ("0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e").toLowerCase(),
  ("0xa0dbdadcbcc540be9bf4e9a812035eb1289dad73").toLowerCase()
];

/**
* Update the default wallet factory address in local storage
*/
function checkWalletFactoryAddress() {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));

  if (userConfig && oldWalletFactoryAddresses.indexOf(userConfig.walletFactoryAddress.toLowerCase()) >= 0) {
    userConfig.walletFactoryAddress = txDefaultOrig.walletFactoryAddress;
    localStorage.setItem("userConfig", JSON.stringify(userConfig));
  }
}

/**
* Reload configuration
*/
function loadConfiguration () {
  var userConfig = JSON.parse(localStorage.getItem("userConfig"));
  Object.assign(txDefault, txDefaultOrig, userConfig);
}

checkWalletFactoryAddress();
loadConfiguration();
