var web3 = null;
angular.module('multiSigWeb')
  .run(function(Wallet) {
    Wallet.webInitialized.then(function () {
      web3 = Wallet.web3;
    });
  });
