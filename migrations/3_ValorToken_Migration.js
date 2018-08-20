var ValorToken = artifacts.require("./ValorToken.sol");

module.exports = function(deployer, network, accounts) {
  // for now we are deploying into network with three accounts
  if (network == "develop"){
    deployer.deploy(ValorToken, accounts[0], accounts[1], accounts[2]);
  }

  if (network == "ropsten"){
    deployer.deploy(ValorToken, "0x30d18131e45e87ea443c77f7ccfadf4561458ec8", "0x5da752df882dd0975b709e96e8962187a6b35690", "0x627306090abab3a6e1400e9345bc60c78a8bef57");
  }
};
