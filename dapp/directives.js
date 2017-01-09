(
  function () {
    angular
    .module("multiSigWeb")
    .directive('convertToNumber', function () {
      return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
          ngModel.$parsers.push(function (val) {
            return val !== null ? parseInt(val, 10) : null;
          });
          ngModel.$formatters.push(function (val) {
            return val !== null ? '' + val : null;
          });
        }
      };
    })
    .directive('showHideByConnectivity', function(Connection){
      return {
        link: function(scope, element, attrs){
          /*
          * The HTML is shown by considering the 'showHideByConnectivity'
          * attribute and looking up at the Connection.isConnected variable.
          * Admitted attributes are 'online|offline'.       
          */
          if(!Connection.isConnected && attrs.showHideByConnectivity=='online') {
            element.css("display", "none");
          }
          else if(Connection.isConnected && attrs.showHideByConnectivity=='offline') {
            element.css("display", "none");
          }
        }
      };
    });
  }
)();
