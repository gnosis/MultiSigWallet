var ValorToken = artifacts.require("./ValorToken.sol");

module.exports = function(deployer, network, accounts) {
  // for now we are deploying into network with three accounts
  if (network == "develop"){
    deployer.deploy(ValorToken, "0x30d18131e45e87ea443c77f7ccfadf4561458ec8", accounts[1], accounts[2]);
  }
};
