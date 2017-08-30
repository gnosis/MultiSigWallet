var web3 = window.web3;
angular.module('multiSigWeb')
  .run(function(Wallet) {
    Wallet.webInitialized.then(function () {
      web3 = Wallet.web3;
    });
  });
