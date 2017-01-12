describe('Wallet Service', function(){

  var service;

  beforeEach(module('multiSigWeb'));

  beforeEach(inject(function(_Wallet_){
    console.log('Injecting Wallet Service');
    service = _Wallet_;
    //walletService.webInitialized.then(function () {console.log('then');});
    console.log('Service injected');
  }));

  it('init test', function(){
    
  });


});
