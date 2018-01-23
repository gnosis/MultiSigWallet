(
  function () {
    angular
    .module('multiSigWeb')
    .service('Transaction', function(Web3Service, Wallet, $rootScope, $uibModal, $interval, $q) {
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
        Web3Service.web3.eth.getTransaction(
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
        Web3Service.sendTransaction(
          Web3Service.web3.eth,
          [
            tx
          ],
          { onlySimulate: false },
          function (e, txHash) {
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
          }
        );
      };

      factory.simulate = function (tx, cb) {
        Web3Service.sendTransaction(
          Web3Service.web3.eth,
          [
            tx
          ],
          { onlySimulate: true },
          function (e, txHash) {
            if (e) {
              cb(e);
            }
            else {
              cb(null, txHash);
            }
          }
        );
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
              from: Web3Service.coinbase,
              to: txObject.to,
              value: txObject.value,
              gasPrice: ethereumjs.Util.intToHex(Wallet.txParams.gasPrice),
              gas: ethereumjs.Util.intToHex(Wallet.txParams.gasLimit),
              nonce: ethereumjs.Util.intToHex(nonce)
            };

            Web3Service.web3.eth.signTransaction(txInfo, function(e, signed) {
              if (e) {
                cb(e);
              }
              else{
                cb(e, signed.raw);
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
        var instance = Web3Service.web3.eth.contract(abi).at(tx.to);

        tx.data = instance[method].getData.apply(this, params);

        factory.signOffline(tx, cb);
      };

      /**
      * Send transaction, signed by wallet service provider. Needs abi,
      * selected method to execute and related params.
      */
      factory.sendMethod = function (tx, abi, method, params, cb) {
        // Instance contract
        var instance = Web3Service.web3.eth.contract(abi).at(tx.to);
        var transactionParams = params.slice();
        transactionParams.push(tx);

        try {
          Web3Service.sendTransaction(
            instance[method],
            transactionParams,
            { onlySimulate: false },
            function (e, txHash) {
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
        }
        catch (e) {
          cb(e);
        }
      };

      factory.simulateMethod = function (tx, abi, method, params, cb) {
        // Instance contract
        var instance = Web3Service.web3.eth.contract(abi).at(tx.to);

        try {
          Web3Service.sendTransaction(
            instance[method],
            params,
            { onlySimulate: true },
            function (e, txHash) {
              if (e) {
                cb(e);
              }
              else {
                cb(null, txHash);
              }
          });
        }
        catch (e) {
          cb(e);
        }
      };

      /**
      * Send signed transaction
      **/
      factory.sendRawTransaction = function (tx, cb) {
        Web3Service.web3.eth.sendRawTransaction(
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
        var batch = Web3Service.web3.createBatch();

        // Add transactions without receipt to batch request
        var transactions = factory.get();
        var txHashes = Object.keys(transactions);

        for (var i=0; i<txHashes.length; i++) {
          var tx = transactions[txHashes[i]];
          // Get transaction receipt
          if (tx && !tx.receipt) {
            batch.add(
              Web3Service.web3.eth.getTransactionReceipt.request(txHashes[i], processReceipt)
            );
          }
          // Get transaction info
          if (tx && !tx.info) {
            batch.add(
              Web3Service.web3.eth.getTransaction.request(
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
          Web3Service.webInitialized.then(
            function () {
              Web3Service.web3.eth.getBlock(0, function(e, block) {
                var data = {};

                if (e) {
                  reject();
                }
                else if (block && block.hash == "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3") {
                  data.chain = "mainnet";
                  data.etherscan = "https://etherscan.io";
                  data.walletFactoryAddress = "0xed5a90efa30637606ddaf4f4b3d42bb49d79bd4e";
                }
                else if (block && block.hash == "0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d") {
                  data.chain = "ropsten";
                  data.etherscan = "https://ropsten.etherscan.io";
                  data.walletFactoryAddress = "0x5cb85db3e237cac78cbb3fd63e84488cac5bd3dd";
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

      Web3Service
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
