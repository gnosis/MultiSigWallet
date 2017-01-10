(
  function () {
    angular
    .module("multiSigWeb")
    .service("Token", function (Wallet) {
      var factory = {};

      factory.abi = abiJSON.token.abi;

      factory.balanceOf = function (address, owner, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.balanceOf,
          [owner],
          cb
        );
      };

      factory.name = function (address, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.name,
          [],
          cb
        );
      };

      factory.symbol = function (address, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.symbol,
          [],
          cb
        );
      };

      factory.decimals = function (address, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(address);
        return Wallet.callRequest(
          instance.decimals,
          [],
          cb
        );
      };

      factory.transfer = function (tokenAddress, to, value, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(tokenAddress);
        instance.transfer(to, value, cb);
      };

      factory.transferOffline = function (tokenAddress, to, value, cb) {
        var instance = Wallet.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = instance.transfer.getData(to, value);

        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            Wallet.offlineTransaction(tokenAddress, data, nonce, cb);
          }
        });
      };

      factory.withdraw = function (tokenAddress, wallet, to, value, cb) {
        var walletInstance = Wallet.web3.eth.contract(Wallet.json.multiSigDailyLimit.abi).at(wallet);
        var tokenInstance = Wallet.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = tokenInstance.transfer.getData(
          to,
          value
        );
        // Get nonce
        Wallet.getNonce(wallet, tokenAddress, "0x0", data, function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            walletInstance.submitTransaction(tokenAddress, "0x0", data, nonce, Wallet.txDefaults(), cb);
          }
        }).call();
      };

      factory.withdrawOffline = function (tokenAddress, wallet, to, value, cb) {
        var walletInstance = Wallet.web3.eth.contract(Wallet.json.multiSigDailyLimit.abi).at(wallet);
        var tokenInstance = Wallet.web3.eth.contract(factory.abi).at(tokenAddress);
        var data = tokenInstance.transfer.getData(
          to,
          value
        );

        // Get nonce
        Wallet.getWalletNonces(function (e, nonces) {
          if (e) {
            cb(e);
          }
          else {
            var mainData = walletInstance.submitTransaction.getData(tokenAddress, "0x0", data, nonces.multisig, cb);
            Wallet.offlineTransaction(wallet, mainData, nonces.account, cb);
          }
        });
      }

      factory.withdrawData = function (tokenAddress, to, value) {
        var tokenInstance = Wallet.web3.eth.contract(factory.abi).at(tokenAddress);
        return tokenInstance.transfer.getData(
          to,
          value
        );
      }

      return factory;
    });
  }
)();
