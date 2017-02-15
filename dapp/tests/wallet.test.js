describe('Wallet Service', function(){

  var walletService = {};
  var transactionService = {};
  var utilsService = {};
  var accounts = ["0x291d64e40fdc9eb1ae5721e6dc5d60260e61a7b1", "0xcf9428b6257a19eb4f6640ab9ead9a5bb5bae3c1"];
  var destination = "0xE3eB3DA4cae8BE5eFF65886A399e9f8E36a290A5";
  var host = 'http://localhost:4000';
  var web3;
  var snapId;
  var walletAddress;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  beforeEach(function (done) {
      module('multiSigWeb');
      inject(
        function ($injector) {
          // Inject Services
          walletService = $injector.get('Wallet');
          transactionService = $injector.get('Transaction');
          transactionService.Wallet = walletService;
          utilsService = $injector.get('Utils');

          web3 = new Web3(new Web3.providers.HttpProvider(host));
          web3.eth.defaultAccount = web3.eth.accounts[0]; //set default account;

          // Mock Tx params in a function
          var getTxParams = function (tx) {
            var defaultObj = {
              nonce: web3.eth.getTransactionCount(accounts[0]),
              from: accounts[0],
              gasPrice: 20000000000,
              gas: '0x47E7C4',
              gasLimit: txDefault.gasLimit
            };

            Object.assign(defaultObj, tx);
            return defaultObj;
          };

          spyOn(walletService, ['web3'] ).and.returnValue(web3); //Doesn't work
          walletService.web3 = web3;
          spyOn(walletService, ['txParams'] ).and.returnValue(getTxParams);
          spyOn(utilsService, ['dangerAlert'] ).and.returnValue({});

          var $q = $injector.get('$q');
          var webInitialized = $q(function (resolve, reject) {
            console.log("call webInitialized");
          });

          spyOn(walletService, ['webInitialized'] ).and.returnValue(webInitialized);
          spyOn(walletService, ['initParams'] ).and.returnValue(function(){
            console.log("call initParams");
          });

          spyOn(walletService, ['txDefaults']).and.callFake(getTxParams);

          var addTx = function(tx) {
            console.log("Called Transaction.add");
          };
          spyOn(transactionService, ['add']).and.callFake(addTx);
          spyOn(transactionService, ['get']).and.callFake(function(){
            console.log('called Transaction.get');
            return {};
          });

          /*var store = {};
          spyOn(localStorage, ['getItem']).and.returnValue(function (key) {
            console.log('get item from localstorage');
            return store[key];
          });
          spyOn(localStorage, ['setItem']).and.returnValue(function (key, value) {
            console.log('set item in localstorage');
            return store[key] = value + '';
          });
          spyOn(localStorage, ['clear']).and.returnValue(function () {
            console.log('clear localstorage');
            store = {};
          });*/

          walletService.deployWithLimit(accounts, 1, new Web3().toBigNumber(1).mul('1e18'),
            function (e, r) {
              if (r.address) {

                // Deposit
                web3.currentProvider.sendAsync({
                      jsonrpc: "2.0",
                      method: "evm_snapshot",
                      id: 123456
                    }, function (e, response) {

                      console.log("before");
                      console.log(response);

                      snapId = response.result;
                      walletAddress = r.address;

                      expect(typeof(walletAddress)).toEqual("string");
                      console.log("Before Test configurated");
                      done();
                });

              }
            }
          );

      });
  });

  afterEach(function (done) {
    web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_revert",
            id: 123456,
            params: [snapId]
          }, function (e, response) {
            console.log("after");
            console.log(response);
            done();
      });
  });

  /*it('Deploy new Wallet', function (done) {

    var limit = 1;

    walletService.deployWithLimit([accounts[0]], 1, new Web3().toBigNumber(limit).mul('1e18'),
      function (e, r) {
        console.log(e.message);
        if (r.address) {
          var batch = web3.createBatch();

          batch.add(
            walletService.getLimit(r.address, function (e1, r1) {
                expect(limit).toBe(r1.div('1e18').toNumber());
                done();
            })
          );

          batch.execute();

        }
      }
    );
  });*/

  it('Update required confirmations', function (done) {
    var required = 2;
    var instance = web3.eth.contract(walletService.json.multiSigDailyLimit.abi).at(walletAddress);
    var data = instance.changeRequirement.getData(required);

    walletService.getTransactionCount(walletAddress, true, true, function (e, count) {
      expect(e).toBe(null);
      instance.submitTransaction(walletAddress, "0x0", data, count, walletService.txDefaults());
      var batch = web3.createBatch();
      batch.add(
        walletService.getRequired(walletAddress, function (e1, r1) {
          expect(r1.eq(2)).toBe(true);
          done();
        })
      );
      batch.execute();
    }).call();
  });

  it('Update daily limit', function (done) {
    var limit = 2;
    var instance = web3.eth.contract(walletService.json.multiSigDailyLimit.abi).at(walletAddress);
    var data = instance.changeDailyLimit.getData(limit);
    expect(typeof(data)).toBe('string');

    var batch = web3.createBatch();
    batch.add(
      walletService.getLimit(walletAddress, function (e, r) {
        expect(e).toBe(null);
        expect(typeof(r)).toBe('object');

        walletService.getTransactionCount(walletAddress, true, true, function (e1, count) {
          expect(e1).toBe(null);
          instance.submitTransaction(walletAddress, "0x0", data, count, walletService.txDefaults());

          var batch2 = web3.createBatch();
          batch2.add(
            walletService.getLimit(walletAddress, function (e2, r2) {
              expect(e).toBe(null);
              expect(r2.eq(2)).toBe(true);
              done();
            })
          );
          batch2.execute();
        }).call();

      })
    );
    batch.execute();
  });

  it('Deposit ether on multisig', function (done) {

    var limit = 1;

    transactionService.send(
      {
        to: walletAddress,
        from: accounts[0],
        value: web3.toBigNumber(1)
      },
      function (e, tx) {
        expect(e).toBe(null);
        expect(tx.blockNumber).toBe(undefined);
        console.log("Deposit transaction was sent.");
        var batch = web3.createBatch();
        batch.add(
          walletService.getBalance(walletAddress, function (e, r) {
            expect(r.eq(1)).toBe(true);
            done();
          })
        );
        batch.execute();
      }
    );
  });

  /*var withdrawTx = {};
  withdrawTx.value = new Web3().toBigNumber(5);
  withdrawTx.to = account;
  withdrawTx.data = '0x0';

  batch.add(
    // Withdraw
    walletService.submitTransaction(
      r.address,
      withdrawTx,
      null,
      null,
      null,
      function (e, tx) {
        var batch2 = web3.createBatch();
        batch2.add(
          web3.eth.getBalance.request(r.address, function (e, rr) {
            expect(rr.toNumber()).toEqual(5);
            done();
          })
        );
        batch2.execute();
      }
    )
  );*/

  /*it('Update required confirmations', function (done) {

    var limit = 1;

    var batch = web3.createBatch();
    batch.add(
      walletService.getRequired(walletAddress, function (e1, r1) {
        expect(e1).toBe(null);
        expect(r1.eq(1)).toBe(true);

        // Update required confirmations
        walletService.updateRequired(walletAddress, 2, function (e2, r2) {
          //expect(e2).toBe(null);

          var batch2 = web3.createBatch();
          batch2.add(
            walletService.getRequired(walletAddress, function (e3, r3) {
              expect(r3.toNumber()).toBe(2);
              done();
            })
          );
          batch2.execute();
        });
      })
    );

    batch.execute();

  });*/

  /*it('Send multisig transaction', function (done) {
    var limit = 100;

    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(limit).mul('1e18'),
      function (e, r) {
        if (r.address) {
          var walletKey = r.address;

          var depositObj = {
            to : walletKey,
            from : account,
            value : new Web3().toBigNumber(100).mul('1e18'),
            nonce : web3.eth.getTransactionCount(account)
          };

          // Do deposit from User Account into the wallet
          transactionService.send(depositObj, function (e1, r1) {

            // Test  has been incremented
            var balanceAterDeposit = web3.eth.getBalance(walletKey);
            expect(100).toEqual(balanceAterDeposit.div('1e18').toNumber());

            var tx = {}
            tx.value = new Web3().toBigNumber(100).mul('1e18');
            tx.to = account;

            // Send multisig Tx
            walletService.submitTransaction(
              walletKey,
              tx,
              null,
              null,
              [],
              function (e2, r2) {

                var balanceAterTx = web3.eth.getBalance(walletKey);
                expect(0).toEqual(balanceAterTx.div('1e18').toNumber());

                done();

              }
            );

          });

        }
      }
    );

  });*/

  // it('Update wallet', function (done) {
  //   var limit = 1;
  //
  //   walletService.deployWithLimit([account], 1, new Web3().toBigNumber(limit).mul('1e18'),
  //     function (e, r) {
  //       if (r.address) {
  //
  //         var owner = {'0x291d64e40fdc9eb1ae5721e6dc5d60260e61a7b1':{'address':'0x291d64e40fdc9eb1ae5721e6dc5d60260e61a7b1'}};
  //         var owners = [owner];
  //         r.name = 'TestWallet';
  //         r.owners = owners;
  //         //walletService.updateWallet(r);
  //
  //         var owners = {};
  //         for (var key in r.owners) {
  //           console.log(key);
  //           console.log(r.owners[key]);
  //           r.owners[key].address = r.owners[key].address.toLowerCase();
  //           owners[key.toLowerCase()] = r.owners[key];
  //         }
  //
  //         //expect(walletService.wallets[r.address].name).toBe(r.name)
  //         done();
  //       }
  //     }
  //   );
  // });

  // it('Remove wallet', function (done) {
  //   walletService.deployWithLimit([account], 1, new Web3().toBigNumber(0).mul('1e18'),
  //     function (e, r) {
  //       if (r.address) {
  //         walletService.updateWallet(r); // Add transaction to walletService.wallets
  //         expect(walletService.wallets[r.address]).not.toBe(undefined);
  //         walletService.removeWallet(r.address);
  //         expect(walletService.wallets[r.address]).toBe(undefined);
  //         done();
  //       }
  //     }
  //   );
  // });

  /*it('Deposit and Withdraw', function (done) {

    var limit = 1;
    var deposit = 10;

    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        if (r.address) {
          // Deposit
          transactionService.send(
            {
              to: r.address,
              from: account,
              value: new Web3().toBigNumber(deposit)
            },
            function (e, tx) {

              var batch = web3.createBatch();
              console.log("Deposit transaction was sent.");
              // Get balance
              batch.add(
                web3.eth.getBalance.request(r.address, function (e, response) {

                  expect(response.toNumber()).toEqual(deposit);

                  var withdrawTx = {};
                  withdrawTx.value = new Web3().toBigNumber(5);
                  withdrawTx.to = account;
                  withdrawTx.data = '0x0';

                  batch.add(
                    // Withdraw
                    walletService.submitTransaction(
                      r.address,
                      withdrawTx,
                      null,
                      null,
                      null,
                      function (e, tx) {
                        var batch2 = web3.createBatch();
                        batch2.add(
                          web3.eth.getBalance.request(r.address, function (e, rr) {
                            expect(rr.toNumber()).toEqual(5);
                            done();
                          })
                        );
                        batch2.execute();
                      }
                    )
                  );
                })
              );
              batch.execute();
            }
          );
        }
      }
    );
  });*/

  // it('Add owner', function (done) {
  //
  //   walletService.deployWithLimit([account], 1, new Web3().toBigNumber(0).mul('1e18'),
  //     function (e, r) {
  //       if (e) {
  //         console.log(e.message);
  //       }
  //
  //       if (r.address) {
  //
  //         var walletKey = r.address;
  //
  //         walletService.addOwner(walletKey, {address: destination},
  //           function (e, tx) {
  //             console.log('add owner');
  //             console.log(e.message);
  //             var batch = web3.createBatch();
  //
  //             batch.add(
  //               walletService.getOwners(walletKey, function(e2, r2) {
  //                 expect(r2).toContain(destination.toLowerCase());
  //                 done();
  //               })
  //             );
  //
  //             batch.execute();
  //
  //           }
  //         );
  //
  //         done();
  //       }
  //     }
  //   );
  // });


});
