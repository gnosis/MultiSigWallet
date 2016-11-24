(
  function(){
    angular
    .module("multiSigWeb")
    .filter('objectToArray', function(){
      return function(objectMap) {
        var returnedArray = [];
        if (objectMap) {
          var keys = Object.keys(objectMap);
          for(var i=0; i<keys.length; i++){
            returnedArray.push(objectMap[keys[i]]);
          }
        }
        return returnedArray;
      };
    });
  }
)();
