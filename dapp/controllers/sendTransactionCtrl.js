(
  function(){
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function($scope, Wallet, Utils, Transaction){
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
          Transaction.sendMethod($scope.tx, $scope.abiArray, $scope.method.name, $scope.params, function(e, txHash){
            console.log(e, txHash);
          });
        }
        else{
          Transaction.send($scope.tx, function(e, txHash){
            console.log(e, txHash);
          });
        }
      }

      $scope.signOff = function(){
        Transaction.signOffline($scope.tx, function(e, tx){
          Utils.success('<div class="form-group"><label>Signed transaction: '+
          '</label> <textarea class="form-control" rows="5">'+ tx + '</textarea></div>');
        });
      }

      $scope.updateMethods = function(){
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function(item, index){
          if(!item.constant && item.name){
            $scope.methods.push({name: item.name, index: index});
          }
        });
      }
    });
  }
)();
