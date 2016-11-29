(
  function(){
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function($scope, Wallet, Utils, Transaction){

      // Init wallets collection
      $scope.$watch(
        function(){
          return Wallet.wallets;
        },
        function(){
          $scope.wallets = Wallet.wallets;
          $scope.totalItems = Object.keys($scope.wallets).length;
          var batch = Wallet.web3.createBatch();
          // Init wallet balance of each wallet address
          Object.keys($scope.wallets).map(function(address){            
            batch.add(
              Wallet.getBalance(
                address,
                function(e, balance){
                  $scope.wallets[address].balance = balance.div('1e18').toNumber();
                  $scope.$apply();
                }
              )
            );
          });
          batch.execute();
        }
      );

      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;
      $scope.view = 'list';
      $scope.new = {
        name: 'MultiSig Wallet',
        owners: {},
        confirmations : 1
      };

      // Deploy MultiSigWallet to the blockchain
      $scope.deployWallet = function(){
        Wallet.deployWallet(Object.keys($scope.new.owners), $scope.new.confirmations,
          function(e, contract){
            if(e){
              Utils.dangerAlert(e);
            }
            else{
              if(contract.address){
                // Save wallet
                Wallet.addWallet({name: $scope.new.name, address: contract.address, owners: $scope.new.owners});

                Utils.success("Multisignature wallet deployed with address "+contract.address);
              }
              else{
                Transaction.add({txHash: contract.transactionHash});
                $scope.view = 'list';
                Utils.notification("Transaction sent, wallet will be deployed in next 20s")
              }
            }
          }
        );
      }

      // Deploy Offline
      $scope.deployOfflineWallet = function(){
        Wallet.deployOfflineWallet(Object.keys($scope.new.owners), $scope.new.confirmations,
        function(e, tx){
          if(e){
            Utils.error(e);
          }
          else{
            Utils.success('<div class="form-group"><label>Multisignature wallet '+
            'deployed offline:</label> <textarea class="form-control" rows="5">'+ tx + '</textarea></div>');
          }

        });

      }

      $scope.newWalletSelect = function(){
        $scope.view = 'select';
        $scope.walletOption = 'create';
        $scope.owner = {
          name: "My account",
          address: Wallet.coinbase
        };
        $scope.new.owners[$scope.owner.address] = {};
        angular.copy($scope.owner, $scope.new.owners[$scope.owner.address])
      }

      $scope.newWallet = function(){
        if($scope.walletOption == 'create'){
            $scope.view = 'create';
        }
        else{
          $scope.view = 'restore';
        }
      }

      $scope.addOwner = function(){
        $scope.new.owners[$scope.owner.address] = {};
        angular.copy($scope.owner, $scope.new.owners[$scope.owner.address]);
      }

      $scope.removeOwner = function(address){
        delete $scope.new.owners[address]
      }

      $scope.removeWallet = function(address){
        Wallet.removeWallet(address);
      }

      $scope.restoreWallet = function(e, w){
        Wallet.restore($scope.old, function(){
          if(e){
            Utils.error(e);
          }
          else{
            $scope.view = 'list';
          }
        });
      }

    });
  }
)();
