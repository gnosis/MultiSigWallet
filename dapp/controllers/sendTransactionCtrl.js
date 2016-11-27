(
  function(){
    angular
    .module("multiSigWeb")
    .controller("sendTransactionCtrl", function($scope, Wallet, Utils){
      $scope.methods = [];
      $scope.tx = {};

      $scope.$watch(
        function(){
          return Wallet.txParams.nonce;
        },
        function(){
          $scope.tx.nonce = Wallet.txParams.nonce;
        }
      );

      $scope.send = function(){
        // if method, use contract instance method TODO
        if($scope.method){

        }
        else{
          
        }
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
