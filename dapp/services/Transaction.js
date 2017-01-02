(
  function () {
    angular
    .module('multiSigWeb')
    .service('Transaction', function(Wallet, $rootScope, $uibModal) {
      var factory = {
        transactions: JSON.parse(localStorage.getItem("transactions")) || {}
      };

      /**
      * Add transaction object to the transactions collection
      */
      factory.add = function (tx) {
        factory.transactions[tx.txHash] = tx;
        tx.date = new Date();
        localStorage.setItem("transactions", JSON.stringify(factory.transactions));
        try {
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Remove transaction identified by transaction hash from the transactions collection
      */
      factory.remove = function (txHash) {
        delete factory.transactions[txHash];
        localStorage.setItem("transactions", JSON.stringify(factory.transactions));
        try{
          $rootScope.$digest();
        }
        catch (e) {}
      };

      /**
      * Remove all transactions
      */
      factory.removeAll = function () {
        factory.transactions = {};
        localStorage.removeItem("transactions");
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
              var signature = EthJS.Util.fromRpcSig(sig);
              tx.v = EthJS.Util.intToHex(signature.v);
              tx.r = EthJS.Util.bufferToHex(signature.r);
              tx.s = EthJS.Util.bufferToHex(signature.s);

              // Return raw transaction as hex string
              cb(null, EthJS.Util.bufferToHex(tx.serialize()));
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
        transactionParams.push({
          to: tx.to?tx.to:null,
          value: tx.value?tx.value:null,
          data: tx.data?tx.data:null,
          nonce: tx.nonce
        });
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
        instance[method].sendTransaction.apply(this, transactionParams);

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
        var txHashes = Object.keys(factory.transactions);

        function processReceipt(e, receipt) {
          if (!e && receipt) {
            factory.transactions[receipt.transactionHash].receipt = receipt;
            // call callback if it has
            if (factory.transactions[receipt.transactionHash].callback) {
              factory.transactions[receipt.transactionHash].callback(receipt);
            }

            // update transactions
            localStorage.setItem("transactions", JSON.stringify(factory.transactions));
            try{
              $rootScope.$digest();
            }
            catch (error) {}
          }
        }

        function getTransactionInfo(e, info) {
          if (!e && info) {
            factory.transactions[info.hash].info = info;

            // update transactions
            localStorage.setItem("transactions", JSON.stringify(factory.transactions));
            try{
              $rootScope.$digest();
            }
            catch (error) {}
          }
        }
        for (var i=0; i<txHashes.length; i++) {
          var tx = factory.transactions[txHashes[i]];
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
        setTimeout(factory.checkReceipts, 15000);
      };

      Wallet
      .webInitialized
      .then(
        function () {
          // init transactions loop
          factory.checkReceipts();
        }
      );

      return factory;
    });
  }
)();
