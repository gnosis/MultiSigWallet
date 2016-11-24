(
  function(){
    angular
    .module('multiSigWeb')
    .controller('walletCtrl', function($scope, Wallet, Utils){

      // Init wallets collection
      $scope.wallets = Wallet.wallets;
      $scope.totalItems = Object.keys($scope.wallets).length;
      $scope.currentPage = 1;
      $scope.itemsPerPage = 3;
      $scope.view = 'list';
      $scope.new = {
        name: 'MultiSig Wallet',
        owners: {}
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
                $scope.wallets = Wallet.wallets;
                $scope.totalItems = Object.keys($scope.wallets).length;
                $scope.$apply();

                Utils.success("Multisignature wallet deployed with address "+contract.address);
              }
              else{
                $scope.view = 'list';
                Utils.notification("Transaction sent, wallet will be deployed in next 20s")
              }
            }
          }
        );
      }

      // Deploy Offline
      $scope.deployOfflineWallet = function(){
        console.log("offline");
        Wallet.deployOfflineWallet(Object.keys($scope.new.owners), $scope.new.confirmations,
        function(tx){
          Wallet.addWallet({name: $scope.new.name, owners: $scope.new.owners});
          $scope.wallets = Wallet.wallets;
          $scope.totalItems = Object.keys($scope.wallets).length;
          $scope.$apply();

          Utils.success("Multisignature wallet deployed offline: "+ tx);
        });

      }

      // Get ethereum balance of address
      $scope.balance = function(address){
        return Wallet.getBalance(address);
      }

      // Init wallet balance of each wallet address
      Object.keys($scope.wallets).map(function(address){
        $scope
        .balance(address)
        .then(function(balance){
          $scope.wallets[address].balance = balance;
        });
      });

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

    });
  }
)();
