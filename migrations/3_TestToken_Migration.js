var TestToken = artifacts.require("./TestToken.sol");

module.exports = function(deployer, network, accounts) {
  // for now we are deploying into network with three accounts
  if (network == "develop"){
    deployer.deploy(TestToken);
  }

  if (network == "ropsten"){
    deployer.deploy(TestToken);
  }
};
