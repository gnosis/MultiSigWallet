(
  function(){
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function($scope, Wallet, Utils, Transaction, $uibModalInstance){
      $scope.methods = [];
      $scope.tx = {};
      $scope.params = [];

      $scope.$watch(
        function(){
          return Wallet.txParams.nonce;
        },
        function(){
          $scope.tx.nonce = Wallet.txParams.nonce;
        }
      );

      $scope.send = function(){
        // if method, use contract instance method
        if($scope.method){
          Transaction.sendMethod($scope.tx, $scope.abiArray, $scope.method.name, $scope.params, function(e, tx){
            if(tx.blockNumber){
              Utils.success("Transaction mined");
            }
            else{
              $uibModalInstance.close();
              Utils.notification("Transaction sent, will be mined in next 20s");
            }
          });
        }
        else{
          Transaction.send($scope.tx, function(e, tx){
            if(tx.blockNumber){
              Utils.success("Transaction mined");
            }
            else{
              $uibModalInstance.close();
              Utils.notification("Transaction sent, will be mined in next 20s");
            }
          });
        }
      }

      $scope.signOff = function(){
        if($scope.method){
          Transaction.signMethodOffline($scope.tx, $scope.abiArray, $scope.method.name, $scope.params, function(e, tx){
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
        else{
          Transaction.signOffline($scope.tx, function(e, tx){
            $uibModalInstance.close();
            Utils.signed(tx);
          });
        }
      }

      $scope.updateMethods = function(){
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function(item, index){
          if(!item.constant && item.name && item.type == "function"){
            $scope.methods.push({name: item.name, index: index});
          }
        });
      }

      $scope.cancel = function(){
        $uibModalInstance.dismiss();
      }
    });
  }
)();
