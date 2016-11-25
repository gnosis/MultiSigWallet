(
  function(){
    angular
    .module('multiSigWeb')
    .service('Wallet', function($window, $http, $q, $rootScope){

      var wallet = {
        wallets: JSON.parse(localStorage.getItem("wallets")),
        web3 : null,
        json : null,
        txParams: {
          nonce: null,
          gasPrice: null,
          gasLimit: null
        }
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

      wallet.updateAccounts = function(){
        return $q(function(resolve, reject){
          web3.eth.getAccounts(function(e, accounts){
            if(e){
              reject(e);
            }
            else{
              wallet.accounts = accounts;
              wallet.coinbase = accounts?accounts[0]:null;
              resolve(accounts);
            }
          });
        });
      }

      wallet.updateNonce = function(address){
        return $q(function(resolve, reject){
          web3.eth.getTransactionCount(address, function(e, count){
            if(e){
              reject(e);
            }
            else{
              wallet.txParams.nonce = count;
              resolve(count);
            }
          });
        });
      }

      wallet.updateGasPrice = function(){
        return $q(function(resolve, reject){
          web3.eth.getGasPrice(function(e, gasPrice){
            if(e){
              reject(e);
            }
            else{
              wallet.txParams.gasPrice = gasPrice;
              resolve(gasPrice);
            }
          });
        });
      }

      wallet.updateGasLimit = function(){
        return $q(function(resolve, reject){
          web3.eth.getBlock("latest", function(e, block){
            if(e){
              reject(e);
            }
            else{
              wallet.txParams.gasLimit = Math.floor(block.gasLimit*0.9);
              resolve(block.gasLimit);
            }
          });
        });
      }

      // Init txParams
      wallet.initParams = $q(function(resolve, reject){
        wallet
        .updateAccounts()
        .then(function(accounts){
          resolve(accounts)
        });
      }).then(function(accounts){
        return $q.all(
          [
            wallet.updateGasLimit(),
            wallet.updateGasPrice(),
            wallet.updateNonce(accounts[0])
          ]
        );
      });

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
            // Get Transaction Data
            var MyContract = wallet.web3.eth.contract(wallet.json.multiSigWallet.abi);
            var data = MyContract.new.getData(owners, requiredConfirmations, {
              data: wallet.json.multiSigWallet.binHex
            });

            // Create transaction object
            var txInfo = {
              to: '0x0000000000000000000000000000000000000000',
              value: EthJS.Util.intToHex(0),
              gasPrice: '0x' + wallet.txParams.gasPrice.toNumber(16),
              gasLimit: EthJS.Util.intToHex(wallet.txParams.gasLimit),
              nonce: EthJS.Util.intToHex(wallet.txParams.nonce),
              data: '0x' + data
            }

            var tx = new EthJS.Tx(txInfo);

            // Get transaction hash
            var txHash = EthJS.Util.bufferToHex(tx.hash(false));

            // Sign transaction hash
            wallet.web3.eth.sign(wallet.coinbase, txHash, function(e, signature){
              if(e){
                cb(e);
              }
              var signature = EthJS.Util.fromRpcSig(signature);
              tx.v = EthJS.Util.intToHex(signature.v);
              tx.r = EthJS.Util.bufferToHex(signature.r);
              tx.s = EthJS.Util.bufferToHex(signature.s);              

              // Return raw transaction as hex string
              cb(null, EthJS.Util.bufferToHex(tx.serialize()));
            });

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
