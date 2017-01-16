describe('Wallet Service', function(){

  var walletService = {};
  var transactionService = {};
  var account = "0x291d64e40fdc9eb1ae5721e6dc5d60260e61a7b1";
  var destination = "0xE3eB3DA4cae8BE5eFF65886A399e9f8E36a290A5";
  var host = txDefault.ethereumNode;
  var web3;

  beforeEach(function () {
      module('multiSigWeb');
      inject(
        function ($injector) {
          jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
          walletService = $injector.get('Wallet');
          transactionService = $injector.get('Transaction');
          var utilsService = $injector.get('Utils');

          web3 = new Web3(new Web3.providers.HttpProvider(host));
          web3.eth.defaultAccount = web3.eth.accounts[0]; //set default account;

          // Mock Tx params in a function
          var getTxParams = function (tx) {
            var defaultObj = {
              nonce: web3.eth.getTransactionCount(account),
              from: account,
              gasPrice: 20000000000,
              gas: '0x47E7C4',
              gasLimit: txDefault.gasLimit
              //data: abiJSON.multiSigDailyLimit.binHex
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

          web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_snapshot",
                id: 12345
              }, (e, response) => {
                snap_id = response.result;
          });

      });
  });

  afterEach(function () {
    web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_revert",
            id: 12346,
            params: [snap_id]
          }, (e, response) => {

      });
  });

  it('Deploy new Wallet', function (done) {

    var limit = 1;

    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(limit).mul('1e18'),
      function (e, r) {
        if (r.address) {

          walletService.updateWallet(r); // Add wallet to walletService.wallets

          var batch = web3.createBatch();

          batch.add(
            walletService.getLimit(r.address, function (e1, r1) {
                //console.log(r1.div('1e18').toNumber());
                expect(limit).toBe(r1.div('1e18').toNumber());
                done();
            })
          );

          batch.execute();

        }
      }
    );
  });

  it('Send multisig transaction', function (done) {
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

  });

  it('Update wallet', function (done) {

    var limit = 1;

    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(limit).mul('1e18'),
      function (e, r) {
        if (r.address) {
          r.name = 'TestWallet';
          walletService.updateWallet(r);
          expect(walletService.wallets[r.address].name).toBe(r.name)
          done();
        }
      }
    );
  });

  it('Remove wallet', function (done) {
    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        if (r.address) {
          walletService.updateWallet(r); // Add transaction to walletService.wallets
          expect(walletService.wallets[r.address]).not.toBe(undefined);
          walletService.removeWallet(r.address);
          expect(walletService.wallets[r.address]).toBe(undefined);
          done();
        }
      }
    );
  });

  it('Add owner', function (done) {

    walletService.deployWithLimit([account], 1, new Web3().toBigNumber(0).mul('1e18'),
      function (e, r) {
        if (r.address) {

          var walletKey = r.address;

          walletService.addOwner(walletKey, {address: destination},
            function (e, tx) {
              console.log(e.message);
              var batch = web3.createBatch();

              batch.add(
                walletService.getOwners(walletKey, function(e2, r2) {
                  expect(r2).toContain(destination.toLowerCase());
                  done();
                })
              );

              batch.execute();

            }
          );

          done();
        }
      }
    );
  });

});
