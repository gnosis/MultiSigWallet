(
  function () {
    angular
    .module("multiSigWeb")
    .controller("withdrawTokenCtrl", function ($scope, Wallet, Token, Transaction, Utils, wallet, token, $uibModal, $uibModalInstance, Web3Service) {

      $scope.wallet = wallet;
      $scope.token = token;
      $scope.amount = 10;
      $scope.to = Web3Service.coinbase;

      /**
       * Opens the address book modal
       */
      $scope.openAddressBook = function () {
        $uibModal.open({
          templateUrl: 'partials/modals/selectAddressFromBook.html',
          size: 'lg',
          controller: function ($scope, $uibModalInstance) {
            // Load address book
            $scope.addressBook = JSON.parse(localStorage.getItem('addressBook') || '{}');
            // Sort addresses alphabetically
            $scope.addressArray = Object.keys($scope.addressBook).reduce(function (acc, value) {
              acc.push($scope.addressBook[value]);
              return acc;
            }, [])
            .sort(function (a, b) {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            });

            $scope.choose = function (item) {
              $uibModalInstance.close({
                item: item
              });
            };

            $scope.cancel = function () {
              $uibModalInstance.dismiss();
            };
          }
        })
        .result
        .then(function (returnData) {
          // Set transaction's recipient
          if (returnData && returnData.item) {
            $scope.to = returnData.item.address;
          }
        });
      };

      $scope.send = function () {
        Token.withdraw(
          $scope.token.address,
          $scope.wallet.address,
          $scope.to,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals),
          function (e, tx) {
            if (e) {
              Utils.dangerAlert(e);
            }
            else {
              Utils.notification("Withdraw token transaction was sent.");
              $uibModalInstance.close();
              Transaction.add({
                txHash: tx,
                callback: function () {
                  Utils.success("Withdraw token transaction was mined.");
                }
              });
            }
          }
        );
      };

      $scope.signOff = function () {
        Token.withdrawOffline(
          $scope.token.address,
          $scope.wallet.address,
          $scope.to,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals),
          function (e, signed) {
            $uibModalInstance.close();
            Utils.signed(signed);
          }
        );
      };

      $scope.getNonce = function () {
        var value = new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals);
        var data = Token.withdrawData(
          $scope.token.address,
          $scope.to,
          new Web3().toBigNumber($scope.amount).mul('1e' + $scope.token.decimals)
        );
        Wallet.getNonce($scope.wallet.address, $scope.token.address, "0x0", data, function (e, nonce) {
          if (e) {
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            Utils.nonce(nonce);
          }
        }).call();

      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss();
      };
    });
  }
)();
