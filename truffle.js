module.exports = {
  compilers: {
    solc: {
        version: "0.4.15", // A version or constraint - Ex. "^0.5.0"
                         // Can also be set to "native" to use a native solc
        parser: "solcjs"  // Leverages solc-js purely for speedy parsing
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4000000,
      gasPrice: 10000000000, // 10 gwei
    }
  }
};
