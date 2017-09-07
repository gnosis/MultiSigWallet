const MultiSigWallet = artifacts.require('MultiSigWallet')
const web3 = MultiSigWallet.web3
const deployMultisig = (owners, confirmations) => {
    return MultiSigWallet.new(owners, confirmations)
}

const utils = require('./utils')
const ONE_DAY = 24*3600

contract('MultiSigWallet', (accounts) => {
    let multisigInstance
    const requiredConfirmations = 2

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1], accounts[2]], requiredConfirmations)
        assert.ok(multisigInstance)
    })

    it('test execution after requirements changed', async () => {
        const deposit = 1000
        
        // Send money to wallet contract
        await new Promise((resolve, reject) => web3.eth.sendTransaction({to: multisigInstance.address, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        const balance = await utils.balanceOf(web3, multisigInstance.address)
        assert.equal(balance.valueOf(), deposit)
        
        // Add owner wa_4
        const addOwnerData = multisigInstance.contract.addOwner.getData(accounts[3])
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(multisigInstance.address, 0, addOwnerData, {from: accounts[0]}),
            'transactionId',
            null,
            'Submission'
        )

        // There is one pending transaction
        const excludePending = false
        const includePending = true
        const excludeExecuted = false
        const includeExecuted = true
        assert.deepEqual(
            await multisigInstance.getTransactionIds(0, 1, includePending, excludeExecuted),
            [transactionId]
        )

        // Update required to 1
        const newRequired = 1
        const updateRequirementData = multisigInstance.contract.changeRequirement.getData(newRequired)

        // Submit successfully
        const transactionId2 = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(multisigInstance.address, 0, updateRequirementData, {from: accounts[0]}),
            'transactionId',
            null,
            'Submission'
        )

        assert.deepEqual(
            await multisigInstance.getTransactionIds(0, 2, includePending, excludeExecuted),
            [transactionId, transactionId2]
        )

        // Confirm change requirement transaction
        await multisigInstance.confirmTransaction(transactionId2, {from: accounts[1]})
        assert.equal((await multisigInstance.required()).toNumber(), newRequired)
        assert.deepEqual(
            await multisigInstance.getTransactionIds(0, 1, excludePending, includeExecuted),
            [transactionId2]
        )

        // Execution fails, because sender is not wallet owner
        utils.assertThrowsAsynchronously(
            () => multisigInstance.executeTransaction(transactionId, {from: accounts[9]})
        )

        // Because the # required confirmations changed to 1, the addOwner transaction can be executed now
        await multisigInstance.executeTransaction(transactionId, {from: accounts[0]})
        assert.deepEqual(
            await multisigInstance.getTransactionIds(0, 2, excludePending, includeExecuted),
            [transactionId, transactionId2]
        )
    })
})