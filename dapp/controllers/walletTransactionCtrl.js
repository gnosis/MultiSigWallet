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
          if(!item.constant && item.name && item.type == "function"){
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

      $scope.getNonce = function(){
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
            // Open new modal with nonce
            Utils.nonce(nonce);
            // Utils.success("Multisig Nonce: "+nonce);
          }
        }).call();

      }

      $scope.cancel = function(){
        $uibModalInstance.dismiss();
      }
    });
  }
)();
