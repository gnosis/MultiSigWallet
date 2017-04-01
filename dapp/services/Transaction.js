(
  function () {
    angular
    .module('multiSigWeb')
    .service('Transaction', function(Wallet, $rootScope, $uibModal, $interval, $q) {
      var factory = {
        requiredReceipt: {},
        requiredInfo: {},
        updates: 0,
        callbacks: {}
      };

      function processReceipt(e, receipt) {
        if (!e && receipt) {
          receipt.decodedLogs = Wallet.decodeLogs(receipt.logs);
          factory.update(receipt.transactionHash, {receipt: receipt});

          // call callback if it has
          if (factory.callbacks[receipt.transactionHash]) {
            factory.callbacks[receipt.transactionHash](receipt);
          }
        }
      }

      function getTransactionInfo(e, info) {
        if (!e && info) {
          factory.update(info.hash, {info: info});
        }
      }

      factory.get = function () {
        return JSON.parse(localStorage.getItem("transactions")) || {};
      };

      /**
      * Add transaction object to the transactions collection
      */
      factory.add = function (tx) {
        var transactions = factory.get();
        transactions[tx.txHash] = tx;
        if (tx.callback) {
          factory.callbacks[tx.txHash] = tx.callback;
        }
        tx.date = new Date();
        localStorage.setItem("transactions", JSON.stringify(transactions));
        factory.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
        Wallet.web3.eth.getTransaction(
          tx.txHash,
          getTransactionInfo
        );
      };

      factory.update = function (txHash, newObj) {
        var transactions = factory.get();
        Object.assign(transactions[txHash], newObj);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        factory.updates++;
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      factory.notifyObservers = function () {
        factory.updates++;
      };

      /**
      * Remove transaction identified by transaction hash from the transactions collection
      */
      factory.remove = function (txHash) {
        var transactions = factory.get();
        delete transactions[txHash];
        localStorage.setItem("transactions", JSON.stringify(transactions));
        factory.updates++;
        try{
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Remove all transactions
      */
      factory.removeAll = function () {
        localStorage.removeItem("transactions");
        factory.updates++;
        try{
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Send transaction, signed by wallet service provider
      */
      factory.send = function (tx, cb) {
        Wallet.web3.eth.sendTransaction(tx, function (e, txHash) {
          if (e) {
            cb(e);
          }
          else {
            factory.add(
              {
                txHash: txHash,
                callback: function (receipt) {
                  cb(null, receipt);
                }
              }
            );
            cb(null, txHash);
          }
        });
      };

      /**
      * Sign transaction without sending it to an ethereum node
      */
      factory.signOffline = function (txObject, cb) {
        Wallet.getUserNonce(function (e, nonce) {
          if (e) {
            cb(e);
          }
          else {
            // Create transaction object
            var txInfo = {
              to: txObject.to,
              value: txObject.value,
              gasPrice: EthJS.Util.intToHex(Wallet.txParams.gasPrice),
              gasLimit: EthJS.Util.intToHex(Wallet.txParams.gasLimit),
              nonce: EthJS.Util.intToHex(nonce)
            };
            var tx = new EthJS.Tx(txInfo);

            // Get transaction hash
            var txHash = EthJS.Util.bufferToHex(tx.hash(false));

            // Sign transaction hash
            Wallet.web3.eth.sign(Wallet.coinbase, txHash, function (e, sig) {
              if (e) {
                cb(e);
              }
              else {
                var signature = EthJS.Util.fromRpcSig(sig);
                tx.v = EthJS.Util.intToHex(signature.v);
                tx.r = EthJS.Util.bufferToHex(signature.r);
                tx.s = EthJS.Util.bufferToHex(signature.s);

                // Return raw transaction as hex string
                cb(null, EthJS.Util.bufferToHex(tx.serialize()));
              }
            });
          }
        });
      };

      /**
      * Sign transaction without sending it to an ethereum node. Needs abi,
      * selected method to execute and related params.
      */
      factory.signMethodOffline = function (tx, abi, method, params, cb) {

        // Get data
        var instance = Wallet.web3.eth.contract(abi).at(tx.to);

        tx.data = instance[method].getData.apply(this, params);

        factory.signOffline(tx, cb);
      };

      /**
      * Send transaction, signed by wallet service provider. Needs abi,
      * selected method to execute and related params.
      */
      factory.sendMethod = function (tx, abi, method, params, cb) {
        // Instance contract
        var instance = Wallet.web3.eth.contract(abi).at(tx.to);
        var transactionParams = params.slice();

        // sendTransction takes (param1, param2, ..., paramN, txObject, cb)
        transactionParams.push(tx);
        transactionParams.push(function (e, txHash) {
          if (e) {
            cb(e);
          }
          else {
              // Add transaction
              factory.add(
                {
                  txHash: txHash,
                  callback: function (receipt) {
                    cb(null, receipt);
                  }
                }
              );
              cb(null, txHash);
          }
        });
        try {
          instance[method].apply(instance[method], transactionParams);
        }
        catch (e) {
          cb(e);
        }
      };

      /**
      * Send signed transaction
      **/
      factory.sendRawTransaction = function (tx, cb) {
        Wallet.web3.eth.sendRawTransaction(
          tx,
          cb
        );
      };

      /**
      * Internal loop, checking for transaction receipts and transaction info.
      * calls callback after receipt is retrieved.
      */
      factory.checkReceipts = function () {
        // Create batch object
        var batch = Wallet.web3.createBatch();

        // Add transactions without receipt to batch request
        var transactions = factory.get();
        var txHashes = Object.keys(transactions);

        for (var i=0; i<txHashes.length; i++) {
          var tx = transactions[txHashes[i]];
          // Get transaction receipt
          if (tx && !tx.receipt) {
            batch.add(
              Wallet.web3.eth.getTransactionReceipt.request(txHashes[i], processReceipt)
            );
          }
          // Get transaction info
          if (tx && !tx.info) {
            batch.add(
              Wallet.web3.eth.getTransaction.request(
                txHashes[i],
                getTransactionInfo
              )
            );
          }
        }

        batch.execute();
      };

      factory.getEthereumChain = function () {
        return $q(function (resolve, reject) {
          Wallet.webInitialized.then(
            function () {
              console.log("get chain");
              Wallet.web3.eth.getBlock(0, function(e, block) {
                var data = {};

                if (e) {
                  reject();
                }
                else if (block && block.hash == "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3") {
                  data.chain = "mainnet";
                  data.etherscan = "https://etherscan.io";
                  data.walletFactoryAddress = "0xA0dbdaDcbCC540be9bF4e9A812035EB1289DaD73";
                }
                else if (block && block.hash == "0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d") {
                  data.chain = "ropsten";
                  data.etherscan = "https://testnet.etherscan.io";
                  data.walletFactoryAddress = "0xa6d9c5f7d4de3cef51ad3b7235d79ccc95114de5";
                }
                else if (block && block.hash == "0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9") {
                  data.chain = "kovan";
                  data.etherscan = "https://kovan.etherscan.io";
                  data.walletFactoryAddress = "0xa0dbdadcbcc540be9bf4e9a812035eb1289dad73";
                }
                else {
                  data.chain = "privatenet";
                  data.etherscan = "https://testnet.etherscan.io";
                  data.walletFactoryAddress = "0xd79426bcee5b46fde413ededeb38364b3e666097";
                }

                resolve(data);
              });
            }
          );
        });
      };

      Wallet
      .webInitialized
      .then(
        function () {
          // init transactions loop
          factory.checkReceipts();
          $interval(factory.checkReceipts, 15000);
        }
      );

      return factory;
    });
  }
)();
