const MultiSigWallet = artifacts.require('MultiSigWallet');
const TestToken = artifacts.require('TestToken');


contract('MultiSigWallet', (accounts) => {
    let testToken;
    let multisigInstance;

    beforeEach(async () => {
      testToken = await TestToken.new();
      multisigInstance = await MultiSigWallet.new([accounts[0], accounts[1], accounts[2]], 2);
      assert.ok(multisigInstance)
      assert.ok(testToken);

      await testToken.transfer(multisigInstance.address, 1000000, {from: accounts[0]});
    })

    it('Transfers TestToken tokens after 2 confirmations', async () => {
        // Encode transfer call for the multisig
        const transferEncoded = testToken.contract.transfer.getData(accounts[5], 1000000)

        // we perform an execution in blockchain but don't store the result to get the transactionId
        // then we perform the real execution and submit the transaction
        let transactionId = await multisigInstance.submitTransaction.call(testToken.address, 0, transferEncoded, {from: accounts[0]});
        await multisigInstance.submitTransaction(testToken.address, 0, transferEncoded, {from: accounts[0]});

        // let's make sure we already have one confirmation for this transaction
        let confirmationCount = await multisigInstance.getConfirmationCount.call(transactionId);
        assert.equal(confirmationCount.toNumber(), 1);

        // here we still don't have enought confirmations, so balance should be empty
        assert.equal(0, await testToken.balanceOf.call(accounts[5]))

        // By adding a new confirmation from accountOne, we are performing the execution of the transfer
        await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]});

        // Check that the transfer has actually occured
        assert.equal(1000000, await testToken.balanceOf.call(accounts[5]))
    })

    it('fails when trying to approve a pending transaction by not an owner', async () => {
        //roles are
        let approver1 = accounts[0];
        let approver2 = accounts[1];
        let tokenHolder = accounts[6];
        let wrongApprover = accounts[3];

        // Issue tokens to the multisig address
        await testToken.transfer(multisigInstance.address, 1000000, {from: approver1})

        // Encode transfer call for the multisig
        const transferEncoded = testToken.contract.transfer.getData(tokenHolder, 1000000)

        // we perform an execution in blockchain but don't store the result to get the transactionId
        // then we perform the real execution and submit the transaction
        let transactionId = await multisigInstance.submitTransaction.call(testToken.address, 0, transferEncoded, {from: approver1});
        await multisigInstance.submitTransaction(testToken.address, 0, transferEncoded, {from: approver1});

        // let's make sure we already have one confirmation for this transaction
        let confirmationCount = await multisigInstance.getConfirmationCount.call(transactionId);
        assert.equal(confirmationCount.toNumber(), 1);

        // here we still don't have enought confirmations, so balance should be empty
        // By adding a new confirmation from accountOne, we are performing the execution of the transfer
        assert.equal(0, await testToken.balanceOf.call(tokenHolder))

        try{
          await multisigInstance.confirmTransaction(transactionId, {from: wrongApprover});
          assert.isNotOk("We shouldn't have reached this. Transaction was not reverted.");
        } catch (Error){
            // wrongApprover couldn't confirm pending transaction
            assert.isOk(Error, "Transaction was reverted.");
        }

        // tokens are still frozen wainting for new approver
        assert.equal(0, await testToken.balanceOf.call(tokenHolder))

        // approve and transfer
        await multisigInstance.confirmTransaction(transactionId, {from: approver2});
        assert.equal(1000000, await testToken.balanceOf.call(tokenHolder))
    })

    it(' fails transfer execution if the multisig wallet does not have enought balance', async () => {
      let smartValorAmount = 2000000

      // let's validate the multisig wallet has no balance.
      let currentBalance = await testToken.balanceOf.call(multisigInstance.address)
      assert.equal(1000000, currentBalance.toNumber());

      // encode a new transfer transaction
      const transferEncoded = testToken.contract.transfer.getData(accounts[8], smartValorAmount)

      // we perform an execution in blockchain but don't store the result to get the transactionId
      // then we perform the real execution and submit the transaction
      let transactionId = await multisigInstance.submitTransaction.call(testToken.address, 0, transferEncoded, {from: accounts[0]});
      await multisigInstance.submitTransaction(testToken.address, 0, transferEncoded, {from: accounts[0]});

      // let's make sure we already have one confirmation for this transaction
      let confirmationCount = await multisigInstance.getConfirmationCount.call(transactionId);
      assert.equal(confirmationCount.toNumber(), 1);

      // This confirmation is valid, but transfer should not be executed
      await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]});
      confirmationCount = await multisigInstance.getConfirmationCount.call(transactionId);

      // confirmations are ok, but execution is not.
      assert.equal(confirmationCount.toNumber(), 2);
      assert.isOk(true, await multisigInstance.isConfirmed.call(transactionId));

      // Check that no transfer happened
      assert.equal(0, await testToken.balanceOf.call(accounts[8]))

      // now we will give tokens to the contract and re execute transaction
      await testToken.transfer(multisigInstance.address, smartValorAmount, {from: accounts[0]})

      await multisigInstance.executeTransaction(transactionId, {from: accounts[0]});
      // now tokenHolder should have tokens
      assert.equal(smartValorAmount, await testToken.balanceOf.call(accounts[8]));
    })
})
