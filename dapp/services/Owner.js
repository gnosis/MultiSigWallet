(
  function(){
    angular
    .module("multiSigWeb")
    .service("Owner", function(){
      factory = {};
      factory.owners = JSON.parse(localStorage.getItem("owners")) || {};

      factory.update = function(owner){
        // init
        if(!factory.owners[owner.address]){
            factory.owners[owner.address] = {};
        }

        // Update
        Object.assign(factory.owners[owner.address], owner);
        localStorage.setItem("owners", JSON.stringify(factory.owners));

        try{
          $rootScope.$digest();
        }
        catch(e){}

      };

      factory.remove = function(owner){
        delete factory.owners[owner.address];
        localStorage.setItem("owners", JSON.stringify(factory.owners));

        try{
          $rootScope.$digest();
        }
        catch(e){}
      }

      factory.removeAll = function(){
        factory.owners = {};
        localStorage.setItem("owners", JSON.stringify(factory.owners));

        try{
          $rootScope.$digest();
        }
        catch(e){}
      }

      return factory;
    });
  }
)();
