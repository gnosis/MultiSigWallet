(
  function(){
    angular
    .module("multiSigWeb")
    .controller("getWalletNonceCtrl", function($scope, Wallet, Utils, Transaction, $uibModalInstance, wallet){
      $scope.methods = [];
      $scope.tx = {
        to: "0x0",
        value: "0x0"
      };
      $scope.params = [];

      $scope.ok = function(){
        if($scope.abiArray){
          var instance = Wallet.web3.eth.contract($scope.abiArray).at($scope.tx.to);
          $scope.data = instance[$scope.method.name].getData.apply(this, $scope.params);
        }
        else{
          $scope.data = "0x0";
        }

        Wallet.getNonce(wallet.address, $scope.tx.to, $scope.tx.value, $scope.data, function(e, nonce){
          if(e){
            Utils.dangerAlert(e);
          }
          else{
            $uibModalInstance.close();
            Utils.success("Multisig Nonce: "+nonce);
          }
        }).call();

      }

      $scope.updateMethods = function(){
        $scope.abiArray = JSON.parse($scope.abi);
        $scope.abiArray.map(function(item, index){
          if(!item.constant && item.name){
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
