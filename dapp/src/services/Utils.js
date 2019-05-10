(
  function () {
    angular
    .module("multiSigWeb")
    .service("Utils", function ($uibModal, Notification) {
      var factory = {};

      factory.rejectedTxErrorMessage = 'Transaction rejected by user';
      factory.invalidPassword = 'Invalid password';

      factory.spinner = null;

      factory.showSpinner = function () {
        factory.spinner = $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/spinner.html',
          backdrop: false,
          size: 'sm'
        });
      };

      factory.stopSpinner = function () {
        factory.spinner.close();
      };

      factory.errorToHtml = function (error) {
        if (error.status == 500) {
          return 'Internal Server Error';
        }
        else {
          if (error.data) {
            if (typeof error.data == "string") {
              return error.data;
            }
            else if (error.data) {
              var keys = Object.keys(error.data);
              var html_errors = '<ul class="list-group text-danger">';
              for (var i=0; i<keys.length; i++) {
                if (typeof error.data[keys[i]] == "object" && Object.keys(error.data[keys[i]]).length) {
                  if (isNaN(keys[i])) {
                    html_errors += '<li class="list-group-item">' + keys[i]+factory.errorToHtml({data: error.data[keys[i]]}) + '</li>';
                  }
                  else {
                    html_errors += factory.errorToHtml({data: error.data[keys[i]]});
                  }
                }
                else {
                  html_errors += '<li class="list-group-item">' + error.data[keys[i]] + '</li>';
                }
              }
              html_errors += '</ul>';
              return html_errors;
            }
            else {
              return "";
            }
          }
          else {
            if (typeof error == "object" && error.toString().indexOf("User denied") != -1) {
              return factory.rejectedTxErrorMessage;
            }
            else if (error.toString() == factory.invalidPassword) {
              return factory.invalidPassword;
            }
            else {
              if (error.errorCode) {
                switch (error.errorCode) {
                  case 1:
                    return "Ledger Wallet Error";
                  case 2:
                    return "Bad request";
                  case 3:
                    return "Unsupported configuration";
                  case 4:
                    return "Ineligible device";
                  case 5:
                    return "Ledger Wallet Timeout";

                  default:
                    return "U2F Error";
                }
              }
              else if (error.message) {
                return error.message;
              }
              else {
                return error;
              }
            }
          }
        }
      };

      factory.dangerAlert = function (error) {
        var errorHtml = factory.errorToHtml(error);
        // Just show alert is user don't rejected the tx
        if (errorHtml !== factory.rejectedTxErrorMessage && errorHtml !== factory.invalidPassword) {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            title: 'Error',
            message: errorHtml
          });
        }
      };

      factory.confirmation = function (title, message, cb) {
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_DANGER,
          title: title,
          message: "<strong>"+message+"</strong>",
          buttons: [
            {
              label: 'Ok',
              cssClass: 'btn btn-default',
              // hotkey: 13, // Enter.
              action: function(dialogItself){
                dialogItself.close();
                cb();
              }
            },
            {
              label: 'Cancel',
              cssClass: 'btn btn-danger',
              hotkey: 13, // Enter.
              action: function(dialogItself){
                dialogItself.close();
              }
            }
          ]
        });
      };

      factory.notification = function (info) {
        Notification.primary(info);
      };

      factory.success = function (info) {
        Notification.success(info);
      };

      factory.signed = function (tx) {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/showSignedTransaction.html',
          size: 'lg',
          resolve: {
            signed: function () {
              return tx;
            }
          },
          controller: function ($scope, $uibModalInstance, signed) {
            $scope.signed = signed;

            $scope.copy = function () {
              factory.success("Hex code has been copied to clipboard.");
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      factory.nonce = function (walletNonce) {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/retrieveNonce.html',
          size: 'sm',
          resolve: {
            nonce: function () {
              return walletNonce;
            }
          },
          controller: function ($scope, $uibModalInstance, nonce) {
            $scope.nonce = nonce.toString();

            $scope.copy = function () {
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      factory.simulatedTransaction = function (result) {
        $uibModal.open({
          animation: false,
          templateUrl: 'partials/modals/simulatedTransaction.html',
          size: 'sm',
          resolve: {
            result: function () {
              return result;
            }
          },
          controller: function ($scope, $uibModalInstance, result) {
            $scope.result = typeof result == "string" ? result : result.toString(10); // base 10

            $scope.copy = function () {
              $uibModalInstance.close();
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        });
      };

      factory.isObjectEmpty = function (obj){
        for(var key in obj) {
          if(obj.hasOwnProperty(key)) {
            return false;
          }
        }
        return true;
      };

      factory.trezorHex = function (hex){
        var trezorHex;
        if(hex == undefined || hex == null){
          return ;
        }
        if(hex.length > 2 && hex.slice(0,2) == '0x'){
          trezorHex = hex.slice(2);
        }
        else{
          trezorHex = hex;
        }

        if((trezorHex.length % 2) == 0) {
          return trezorHex;
        }
        else{
          return '0' + trezorHex;
        }
      }

      /**
       * Opens a resource (link to a file, webpage, etc.)
       * @param resource {String} - the resource to open
       */
      factory.openResource = function (resource) {
        if (isElectron) {
          shell.openExternal(resource);
        } else {
          window.open(resource);
        }
      };

      return factory;
    });
  }
)();
