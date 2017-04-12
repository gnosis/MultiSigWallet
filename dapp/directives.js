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
          Wallet.webInitialized.then(
            function () {
              scope.$watch(function(){
                if(Wallet.coinbase) {
                  element.removeAttr('disabled');
                }
                else {
                  attrs.$set('disabled', 'disabled');
                }
              });
            }
          );
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
    })
    .directive('alertEventDescription', function () {
      return {
        link: function(scope, element, attrs) {
          if (attrs.alertEventDescription == 'Submission') {
            element.html('Submission: a new multisig transaction is submitted');
          }
          else if (attrs.alertEventDescription == 'Confirmation') {
            element.html('Confirmation: a multisig transaction is confirmed');
          }
          else if (attrs.alertEventDescription == 'Revocation') {
            element.html('Revocation: a multisig transaction confirmation is revoked');
          }
          else if (attrs.alertEventDescription == 'Execution') {
            element.html('Execution: a multisig transaction is executed successfully');
          }
          else if (attrs.alertEventDescription == 'Execution Failure') {
            element.html('Execution failure: a multisig transaction is executed unsuccessfully');
          }
          else if (attrs.alertEventDescription == 'Deposit') {
            element.html('Deposit: an ether deposit was made');
          }
          else if (attrs.alertEventDescription == 'Owner Addition') {
            element.html('Owner addition: a new multisgi owner was added');
          }
          else if (attrs.alertEventDescription == 'Owner Removal') {
            element.html('Owner removal: a multisig owner was removed');
          }
          else if (attrs.alertEventDescription == 'Requirement Change') {
            element.html('Requirement change: number of required confirmations was changed');
          }
          else if (attrs.alertEventDescription == 'Daily Limit Change') {
            element.html('Daily limit change: amount for daily withdrawal was changed');
          }
          else {
            element.html(attrs.alertEventDescription);
          }
        }
      }
    })
    .directive('match', function($parse) {
      return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          scope.$watch(function() {
            return $parse(attrs.match)(scope) === ctrl.$modelValue;
          }, function(currentValue) {
            ctrl.$setValidity('mismatch', currentValue);
          });
        }
      };
    })
    .directive('providerList', function($parse) {
      return {
        restrict: 'E',
        template: '<select class="form-control" name="web3-wallet" id="web3-wallet"' +
        'ng-options="model.value for model in items track by model.name"' +
        'ng-model="selectedItem"' +
        'ng-change="changeEvent()"></select>',
        scope: {          
          defaultItem: "=",
          changeEvent: "@",
          selectedItem: "="
        },
        replace: true,
        link: function(scope, element, attrs) {
          // Filter items
          scope.items = [];
          if (isElectron) {
            scope.items.push(
              {
                name: 'ledger',
                value: 'Ledger Wallet',
              },
              {
                name: 'lightwallet',
                value: 'Light Wallet',
              }
            );
          }
          else {
              scope.items.push(
                {
                  name: 'injected',
                  value: 'Default (MetaMask, Mist, Parity ...)',
                },
                {
                  name: 'ledger',
                  value: 'Ledger Wallet',
                }
              );
          }


          if (scope.defaultItem) {
            for(var x in scope.items) {
              if (scope.items[x].name == scope.defaultItem) {
                scope.selectedItem = scope.items[x];
                break;
              }
            }
          }
          else {
              scope.selectedItem = null;
          }

          //scope.model = scope.selectedItem;

          scope.changeEvent = function() {
            scope.$parent.config.wallet = scope.selectedItem.name;
          }
        }
      };
    });
  }
)();
