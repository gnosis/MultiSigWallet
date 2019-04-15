// Load secret values from .env.* files depending on APP_CONFIG
require('dotenv').config();

const HDWalletProvider = require("truffle-hdwallet-provider");

// create wallet from existing private key
var privateKeys = [process.env.OWNER_PRIV_KEY];
var ganacheHost = process.env.GANACHE_HOST || '127.0.0.1';


module.exports = {
  compilers: {
    solc: {
      version: "^0.4.15",
    }
  },
  networks: {
    // Ganache interface
    local: {
      host: ganacheHost,
      port: 7545,
      network_id: "*" // Match any network id
    },
    // For running solidity-coverage
    coverage: {
      host: 'localhost',
      port: 8545,
      network_id: "*",
      gas: 0xfffffffffff, 
      gasPrice: 0x01 
    },
    // For using self hosted geth instance
    geth: {
      host: 'http://' + process.env.GETH_ROPSTEN_HOST,
      port: 8545,
      network_id: "*" // Match any network id
    },
    // For using Infura Ropsten Provider
    ropsten: {
      provider: () => new HDWalletProvider(privateKeys, "https://ropsten.infura.io/v3/" + process.env.infuraKey, 0, 1), 
      network_id: 3,
      gas: 5000000,
      gasPrice: 10000000000,
      confirmations: 1,
      skipDryRun: true
    },
    // For using Infura Mainnet Provider
    mainnet: {
      provider: () => new HDWalletProvider(privateKeys, "https://mainnet.infura.io/v3/" + process.env.infuraKey, 0, 1),
      network_id: 1,
      gas: 5000000,
      gasPrice: 10000000000
    }
  }
};
