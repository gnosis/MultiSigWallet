describe('services', function(){

  describe('Connection Service', function(){

    var service;

    beforeEach(module('multiSigWeb'));

    beforeEach(inject(function(_Connection_){
      console.log('Injecting Connection Service');
      service = _Connection_;
      console.log('Service injected');
    }));


    it('Init test', function(){
       expect(service.isConnected).toEqual(true);
    });

  });

});
