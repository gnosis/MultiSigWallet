
const HDWalletProvider = require("truffle-hdwallet-provider");
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4000000,
      gasPrice: 10000000000, // 10 gwei
    },
    ropsten:  {
      provider: () => new HDWalletProvider("tube column poverty remind rebuild skate dad attack hurry waste twenty amount", "https://ropsten.infura.io/mUibnipr7Lc5imbkKKDT"),
      network_id: 3,
      gas: 3000000,
      gasPrice: 21
    }
  }
};
