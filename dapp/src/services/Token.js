(
  function () {
    angular
    .module("multiSigWeb")
    .service("Token", function (Wallet, Web3Service) {
      var factory = {};

      factory.abi = abiJSON.token.abi;

      factory.balanceOf = function (address, owner, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.balanceOf,
          [owner],
          cb
        );
      };

      factory.name = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.name,
          [],
          cb
        );
      };

      factory.symbol = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.symbol,
          [],
          cb
        );
      };

      factory.decimals = function (address, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.decimals,
          [],
          cb
        );
      };

      factory.transfer = function (tokenAddress, to, value, options, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(tokenAddress);
        Web3Service.sendTransaction(
          instance.transfer,
          [
            to,
            value,
            Wallet.txDefaults({
              gas: 200000
            })
          ],
          options,
          cb
        );
      };

      factory.transferOffline = function (tokenAddress, to, value, cb) {
        var instance = Web3Service.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = instance.transfer.getData(to, value);

        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            //Wallet.offlineTransaction(tokenAddress, data, nonce, Wallet.txDefaults(), cb);
            Wallet.offlineTransaction(tokenAddress, data, nonce, cb);
          }
        });
      };

      factory.withdraw = function (tokenAddress, wallet, to, value, options, cb) {
        var walletInstance = Web3Service.web3.eth.contract(Wallet.json.multiSigDailyLimit.abi).at(wallet);
        var tokenInstance = Web3Service.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = tokenInstance.transfer.getData(
          to,
          value
        );
        // Get nonce
        Wallet.getTransactionCount(wallet, true, true, function (e, count) {
          if (e) {
            cb(e);
          }
          else {
        
            Web3Service.configureGas(Wallet.txDefaults({gas: 500000}), function (gasOptions){
              walletInstance.submitTransaction(
                tokenAddress, 
                "0x0", 
                data, 
                count, 
                Wallet.txDefaults({
                  gas: gasOptions.gas,
                  gasPrice: gasOptions.gasPrice
                }), 
                options, 
                cb);
            });
          }
        }).call();
      };

      factory.withdrawOffline = function (tokenAddress, wallet, to, value, cb) {
        var walletInstance = Web3Service.web3.eth.contract(Wallet.json.multiSigDailyLimit.abi).at(wallet);
        var tokenInstance = Web3Service.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = tokenInstance.transfer.getData(
          to,
          value
        );

        // Get nonce
        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = walletInstance.submitTransaction.getData(tokenAddress, "0x0", data);
            Wallet.offlineTransaction(wallet, mainData, nonce, cb);
          }
        });
      };

      factory.withdrawData = function (tokenAddress, to, value) {
        var tokenInstance = Web3Service.web3.eth.contract(factory.abi).at(tokenAddress);
        return tokenInstance.transfer.getData(
          to,
          value
        );
      };

      factory.setDefaultTokens = function (address) {
        /**
        * Set all the default tokens to a given wallet address
        */
        var tokens = {};
        var wallets = Wallet.getAllWallets();

        txDefault.tokens.map(function (token) {
          if (!tokens[token.address]) {
            tokens[token.address] = {
              name: token.name,
              symbol: token.symbol,
              decimals: token.decimals,
              address: token.address
            };
          }
        });

        Object.assign(wallets[address].tokens, tokens);
        localStorage.setItem("wallets", JSON.stringify(wallets));
      };

      return factory;
    });
  }
)();
