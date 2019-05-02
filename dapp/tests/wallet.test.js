describe('Wallet Service', function(){

  var walletService = {};
  var transactionService = {};
  var utilsService = {};
  var connectionService = {};
  var accounts = ["0x291d64e40fdc9eb1ae5721e6dc5d60260e61a7b1", "0xcf9428b6257a19eb4f6640ab9ead9a5bb5bae3c1"];
  var host = 'http://localhost:8545';
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
          web3Service = $injector.get('Web3Service');
          transactionService = $injector.get('Transaction');
          transactionService.Wallet = walletService;
          transactionService.Web3 = web3Service;
          utilsService = $injector.get('Utils');
          connectionService = $injector.get('Connection');
          connectionService.isConnected = true;

          web3 = new Web3(new Web3.providers.HttpProvider(host));
          web3.eth.defaultAccount = web3.eth.accounts[0]; //set default account;
          web3Service.web3 = web3;

          // Mock Tx params in a function
          var getTxParams = function (tx) {
            console.log("Return mocked getTxParams");
            var defaultObj = {
              nonce: web3.eth.getTransactionCount(accounts[0]),
              from: accounts[0],
              gasPrice: 20000000000,
              gas: '0x47E7C4', //'0x47E7C4',
              gasLimit: txDefault.gasLimit,
              walletFactoryAddress : '0x7bf8705722156d74e17d0a3e1dce54779604aab6' 
            };

            Object.assign(defaultObj, tx);
            return defaultObj;
          };

          spyOn(walletService, ['txParams'] ).and.callFake(getTxParams);
          spyOn(walletService, ['txDefaults']).and.callFake(getTxParams);
          spyOn(walletService, ['updateWallet']).and.callFake(function (w) {
            console.log("called mocked function Wallet.updateWallet");
          });

          var $q = $injector.get('$q');
          var webInitialized = $q(function (resolve, reject) {
            console.log("call mocked function webInitialized");
          });

          spyOn(web3Service, ['webInitialized'] ).and.returnValue(webInitialized);
          spyOn(walletService, ['initParams'] ).and.returnValue(function(){
            console.log("call mocked function initParams");
          });

          spyOn(utilsService, ['dangerAlert'] ).and.returnValue({});

          var addTx = function(tx) {
            console.log("Called mocked function Transaction.add");
          };
          spyOn(transactionService, ['add']).and.callFake(addTx);
          spyOn(transactionService, ['get']).and.callFake(function(){
            console.log('called mocked function Transaction.get');
            return {};
          });

          // Mock 'deployWithLimit' to skip configureGas modal
          spyOn(walletService, 'deployWithLimit').and.callFake(function (accounts, requiredConfirmations, limit, cb) {
            var MultiSigDailyLimit = web3Service.web3.eth.contract(abiJSON.multiSigDailyLimit.abi);
            MultiSigDailyLimit.new(
              accounts,
              requiredConfirmations,
              limit,
              {
                data: abiJSON.multiSigDailyLimit.binHex,
                gas: 4000000,
                gasPrice: 1000000000
              },
              cb
            );
          });

          // Mock 'deployWithLimitFactory' to skip configureGas modal 
          spyOn(walletService, 'deployWithLimitFactory').and.callFake(function (accounts, requiredConfirmations, limit, cb) {
            var walletFactory = web3Service.web3.eth.contract(abiJSON.multiSigDailyLimitFactory.abi).at(getTxParams().walletFactoryAddress);

            walletFactory.create(
              accounts,
              requiredConfirmations,
              limit,
              {
                data: abiJSON.multiSigDailyLimit.binHex,
                gas: 4700000,
                gasPrice: 1000000000
              },
              cb
            );

          });

          // Mock 'sendTransaction' to skip configureGas modal
          spyOn(web3Service, 'sendTransaction').and.callFake(function (method, params, options, cb) {
            method.sendTransaction.apply(method.sendTransaction, params.concat(cb));
          });

          walletService.deployWithLimit(accounts, 1, new Web3().toBigNumber(1).mul('1e18'),
            function (e, r) {
              if (r.address) {
                console.log("[Karma] beforeEach, create EVM snapshot");
                web3.currentProvider.sendAsync({
                      jsonrpc: "2.0",
                      method: "evm_snapshot",
                      id: 123456
                    }, function (e, response) {
                      if (!e) {
                        snapId = response.result;
                        walletAddress = r.address;
                        console.log("[Karma] afterEach, snapshot created successfully");
                        expect(typeof(walletAddress)).toEqual("string");
                        done();
                      } else {
                        done.fail(e);
                      }
                });

              }
            }
          );

      });
  });

  afterEach(function (done) {
    console.log("[Karma] AfterEach, revert snapshot");
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_revert",
      id: 12345,
      params: [snapId]
    }, function (e, response) {
      console.log("[Karma] afterEach, EVM snapshot reverted successfully");
      console.log(response);
      done();
    });
  });

  afterAll(function (done) {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "stop_server",
      id: 123456,
      params: []
    }, function (e, response) {
      done();
    });
  });

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

  it('Deploy wallet by factory contract', function (done) {

    walletService.deployWithLimitFactory(accounts, 1, new Web3().toBigNumber(1).mul('1e18'), function (e, tx) {
      expect(e).toBe(null);
      expect(typeof(tx)).toBe('string');
      var res = web3.eth.getTransaction(tx);
      var owner2 = '0x' + res.input.substring(res.input.length-40, res.input.length);
      expect(owner2).toBe(accounts[1]);
      done();
    });
  });

  it('Recover wallet', function (done) {
    var info = {'address' : walletAddress};
    walletService.coinbase = walletAddress;
    walletService.restore(info, function (e, r) {
      expect(e).toBe(null);
      expect(r.address).toBe(walletAddress);
      done();
    });
  });

  it('Increase Daily Limit', function (done) {
    // Increase Daily Limit, withdraw ether under daily limit,
    // until limit is reached (withdraw should not be executed), will be pending for confirmations

    // Deposit
    web3.eth.sendTransaction({
        to: walletAddress,
        from: accounts[0],
        value: web3.toBigNumber(10)
    });


    walletService.updateLimit(walletAddress, new Web3().toBigNumber(2).mul('1e18'), {}, function (e, r){ //.mul('1e18')
      if(e){console.log(e.message);}

      var withdrawTx = {};
      withdrawTx.value = new Web3().toBigNumber(1);
      withdrawTx.to = accounts[0];
      withdrawTx.data = '0x0';

      // Withdraw
      walletService.submitTransaction(
        walletAddress,
        withdrawTx,
        null,
        null,
        null,
        {},
        function (e, tx) {
          expect(e).toBe(null);

          var batch2 = web3.createBatch();
          batch2.add(
            web3.eth.getBalance.request(walletAddress, function (e, response) {
              console.log(response.toNumber());
              expect(response.eq(9)).toEqual(true);

              // Withdraw again
              withdrawTx.value = new Web3().toBigNumber(2).mul('1e18');

              walletService.submitTransaction(
                walletAddress,
                withdrawTx,
                null,
                null,
                null,
                {},
                function (e, tx) {
                  var batch3 = web3.createBatch();
                  batch3.add(
                    web3.eth.getBalance.request(walletAddress, function (e2, response2) {
                      // Balance should not have changed
                      console.log(response2.toNumber());
                      expect(response2.eq(9)).toEqual(true);

                      var batch4 = web3.createBatch();
                      batch4.add(
                        walletService.getTransactionIds(
                          walletAddress,
                          0,
                          3,
                          true,
                          false,
                          function (e, idxs) {
                            expect(e).toBe(null);
                            idxs.map( function(id) {
                              if (id.toNumber()==2) {
                                var batch5 = web3.createBatch();
                                batch5.add(
                                  walletService.getConfirmations(walletAddress, id, function (e, r) {
                                    expect(e).toBe(null);
                                    expect(r.length).toBe(1);
                                    done();
                                  })
                                );
                                batch5.execute();
                              }
                            });
                          }
                        )
                      );
                      batch4.execute();
                    })
                  );
                  batch3.execute();
                });

            })
          );
          batch2.execute();
        }
      );
    });
  });

  it('Add owner', function (done) {
    // Deploy new wallet with 1 owner
    walletService.deployWithLimit([accounts[0]], 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        expect(e).toBe(null);

        if (r.address) {

          var walletAddress = r.address;

          walletService.addOwner(walletAddress, {address: accounts[1]}, {},
            function (e1, tx) {
              console.log('add owner');
              if(e1){console.log(e1);}
              expect(e1).toBe(null);
              var batch = web3.createBatch();

              batch.add(
                walletService.getOwners(walletAddress, function(e3, r3) {
                  expect(r3).toContain(accounts[1].toLowerCase());
                  done();
                })
              );

              batch.execute();

            }
          );
        }
      }
    );
  });

  it('Remove owner', function (done) {
    // Deploy new wallet with 1 owner
    walletService.deployWithLimit(accounts, 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        expect(e).toBe(null);

        if (r.address) {

          var walletAddress = r.address;

          walletService.removeOwner(walletAddress, {'address' : accounts[1]}, {},
            function (e1, tx) {
              console.log('remove owner');
              expect(e1).toBe(null);
              var batch = web3.createBatch();
              batch.add(
                walletService.getOwners(walletAddress, function(e3, r3) {
                  expect(r3).not.toContain(accounts[1].toLowerCase());
                  done();
                })
              );
              batch.execute();
            }
          );
        }
      }
    );
  });

  it('Replace owner', function (done) {
    // Deploy new wallet with 1 owner and then replace it with another one
    walletService.deployWithLimit([accounts[0]], 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        expect(e).toBe(null);
        if (r.address) {
          var walletAddress = r.address;
          walletService.replaceOwner(walletAddress, accounts[0], accounts[1], {},
            function (e1, tx) {
              expect(e1).toBe(null);
              var batch = web3.createBatch();
              batch.add(
                walletService.getOwners(walletAddress, function(e3, r3) {
                  expect(r3).not.toContain(accounts[0].toLowerCase());
                  expect(r3).toContain(accounts[1].toLowerCase());
                  done();
                })
              );
              batch.execute();
            }
          );
        }
      }
    );
  });

});
