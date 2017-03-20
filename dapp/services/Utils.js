(
  function () {
    angular
    .module("multiSigWeb")
    .service("Utils", function ($uibModal) {
      var factory = {};

      factory.rejectedTxErrorMessage = 'Transaction rejected by user';

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
            else {
              return error;
            }
          }
        }
      };

      factory.dangerAlert = function (error) {
        var errorHtml = factory.errorToHtml(error);
        // Just show alert is user don't rejected the tx
        if (errorHtml !== factory.rejectedTxErrorMessage) {
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
        BootstrapDialog.show({
            message: info,
            onshown: function (dialogRef) {
              setTimeout(function () {
                dialogRef.close();
              }, 5000);
            }
          });
      };

      factory.success = function (info) {
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_SUCCESS,
          message: info
        });
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

      factory.showLedgerHelp = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/ledgerHelp.html',
          size: 'md',
          backdrop: 'static',
          windowClass: 'bootstrap-dialog type-info',
          controller: function ($scope, $uibModalInstance) {
            $scope.ok = function () {
              $uibModalInstance.close();
            };

            $scope.checkCoinbase = function () {
              if (!Wallet.coinbase) {
                setTimeout($scope.checkCoinbase, 1000);
              }
            };

            $scope.checkCoinbase();
          }
        });
      };

      return factory;
    });
  }
)();
