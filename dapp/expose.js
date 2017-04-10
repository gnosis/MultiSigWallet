var web3 = window.web3;
angular.module('multiSigWeb')
  .run(function(Web3) {
    Web3.webInitialized.then(function () {
      web3 = Web3.web3;
    });
  });
