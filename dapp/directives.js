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
    .directive('disabledIfNoAccounts', function (Wallet) {
      return {
        link: function(scope, element, attrs){
          Wallet.webInitialized.then(function () {
            if(Wallet.coinbase) {
              element.removeAttr('disabled');
            }
            else {              
              attrs.$set('disabled', 'disabled');
            }
          });
        }
      };
    })
    .directive('showHideByConnectivity', function (Connection) {
      return {
        link: function(scope, element, attrs){
          /*
          * The HTML is shown by considering the 'showHideByConnectivity'
          * attribute and looking up at the Connection.isConnected variable.
          * Admitted attributes are 'online|offline'.
          */
          scope.$watch(function(){
              if(!Connection.isConnected && attrs.showHideByConnectivity=='online') {
                element.css("display", "none");
              }
              else if(Connection.isConnected && attrs.showHideByConnectivity=='offline') {
                element.css("display", "none");
              }
              else {
                element.css("display", "");
              }
            });

        }
      };
    })
    .directive('showHideByFactoryStatus', function (Wallet, Connection) {
      return {
        link: function(scope, element, attrs){
          /*
          * The HTML is shown by considering the 'showHideByConnectivity'
          * attribute and looking up at the Connection.isConnected variable.
          * Admitted attributes are 'online|offline'.
          */
          scope.$watch(function (){
            return txDefault.walletFactoryAddress;
          },
          function(){
            var address = Object.assign({}, txDefault, JSON.parse(localStorage.getItem("userConfig"))).walletFactoryAddress;
            if (address) {
              Wallet.web3.eth.getCode(address, function (e, factory) {
                if (!Connection.isConnected) {
                  element.css("display", "none");
                }
                else if (factory && factory.length > 100) {
                  if (attrs.showHideByFactoryStatus=='online') {
                    element.css("display", "");
                  }
                  else {
                    element.css("display", "none");
                  }
                }
                else {
                  if (attrs.showHideByFactoryStatus=='offline') {
                    element.css("display", "");
                  }
                  else {
                    element.css("display", "none");
                  }
                }
              });
            }
            else {
              if (attrs.showHideByFactoryStatus=='online') {
                element.css("display", "none");
              }
            }
          });

        }
      };
    })
    .directive('valueOrDashByConnectivity', function (Connection) {
      return {
        link: function(scope, element, attrs) {
          /*
          * The value is shown by considering the
          * Connection.isConnected variable.
          */
          scope.$watch(function () {
            if (!Connection.isConnected) {
              element.html("-");
            } else {
              element.html(attrs.valueOrDashByConnectivity);
            }
          });

        }
      };
    });
  }
)();
