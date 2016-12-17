/**
* This controller manages submit new transactions with a wallet
* using submitTransaction function.
*/
(
  function(){
    angular
    .module("multiSigWeb")
    .controller("walletTransactionCtrl", function($scope, Wallet, Transaction, Utils, wallet, $uibModalInstance){

      $scope.wallet = wallet;
      $scope.abiArray = null;
      $scope.method = null;
      $scope.methods = [];
      $scope.params = [];

      // Parse abi
      $scope.updateMethods = function(){
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function(item, index){
          if(!item.constant && item.name){
            $scope.methods.push({name: item.name, index: index});
          }
        });
      }

      $scope.send = function(){
        Wallet.submitTransaction(
          $scope.wallet.address,
          $scope.tx,
          $scope.abiArray,
          $scope.method?$scope.method.name:null,
          $scope.params,
          function(e, tx){
            if(e){
              Utils.dangerAlert(e);
            }
            else{
              Utils.notification("Multisig transaction sent, will be mined in next 20s");
              Transaction.add(
                {
                  txHash: tx,
                  function(e, receipt){
                    Utils.success("Multisig transaction mined");
                  }
                }
              );
              $uibModalInstance.close();
            }
          }
        )
      };

      $scope.signOff = function(){
        Wallet.signTransaction(
          $scope.wallet.address,
          $scope.tx,
          $scope.abiArray,
          $scope.method?$scope.method.name:null,
          $scope.params,
          function(e, tx){
            if(e){
              Utils.dangerAlert(e);
            }
            else{
              $uibModalInstance.close();
              Utils.signed(tx);
            }
          }
        )
      }

      $scope.cancel = function(){
        $uibModalInstance.dismiss();
      }
    });
  }
)();
