(
  function(){
    angular
    .module('multiSigWeb')
    .service('Wallet', function($window, $http, $q, $rootScope){

      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")),
        web3 : null,
        json : null
      }

      // Set web3 provider (Metamask, mist, etc)
      if($window.web3){
        wallet.web3 = new Web3($window.web3.currentProvider);
      }

      // ABI/HEX file, only loaded when needed
      wallet.loadJson = function(){
        return $http
        .get('/abi.json')
        .then(function(json){
          wallet.json = json.data;
        });
      }

      wallet.updateAccounts = function(cb){
        web3.eth.getAccounts(function(e, accounts){
          wallet.accounts = accounts;
          wallet.coinbase = accounts?accounts[0]:null;
          cb(e, accounts);
        });
      }

      wallet.addWallet = function(w){
        var walletCollection = JSON.parse(localStorage.getItem("wallets"));
        if (!walletCollection) walletCollection = {}
        walletCollection[wallet.address] = w;
        localStorage.setItem("wallets", JSON.stringify(walletCollection));
        wallet.wallets = walletCollection;
        try{
          $rootScope.$digest();
        }
        catch(e){

        }
      }

      // Deploy wallet contract with constructor params
      wallet.deployWallet = function(owners, requiredConfirmations, cb){
        $q(function(resolve, reject){
          if(wallet.json){
            resolve();
          }
          else{
            wallet.loadJson()
            .then(function(){
              resolve();
            })
          }
        })
        .then(
          function(){
            var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
            MyContract.new(owners, requiredConfirmations, {
              data: wallet.json.multiSigWallet.binHex
            }, cb);
          }
        )

      }

      // Sign transaction, don't send it
      wallet.deployOfflineWallet = function(owners, requiredConfirmations, cb){
        $q(function(resolve, reject){
          if(wallet.json){
            resolve();
          }
          else{
            wallet.loadJson()
            .then(function(){
              resolve();
            })
          }
        })
        .then(
          function(){
            var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
            console.log("get data");
            var data = MyContract.new.getData(owners, requiredConfirmations, {
              data: wallet.json.multiSigWallet.binHex
            });

            console.log("data ", data);
            wallet.web3.eth.sign(wallet.coinbase, data, cb);


          }
        )

      }

      wallet.getBalance = function(address){
        return $q(function(resolve, reject){
          try{
            wallet.web3.eth.getBalance(address, function(e, balance){
              resolve(balance.div('1e18').toNumber());
            });
          }
          catch(e){
            reject(e);
          }
        });
      };

      return wallet;
    });
  }
)();
