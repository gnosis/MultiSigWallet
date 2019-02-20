const MultiSigWalletWithDailyLimit = artifacts.require('MultiSigWalletWithDailyLimit')
const web3 = MultiSigWalletWithDailyLimit.web3
const TestToken = artifacts.require('TestToken')
const TestCalls = artifacts.require('TestCalls')

const deployToken = () => {
	return TestToken.new()
}
const deployCalls = () => {
	return TestCalls.new()
}

const deployMultisig = (owners, confirmations, limit) => {
    return MultiSigWalletWithDailyLimit.new(owners, confirmations, limit)
}

const utils = require('./utils')
const ONE_DAY = 24*3600

contract('MultiSigWalletWithDailyLimit', (accounts) => {
    let multisigInstance
    const dailyLimit = 3000
    const requiredConfirmations = 2

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1]], requiredConfirmations, dailyLimit)
        assert.ok(multisigInstance)
        tokenInstance = await deployToken()
        assert.ok(tokenInstance)
        callsInstance = await deployCalls()
        assert.ok(callsInstance)

        const deposit = 10000000

        // Send money to wallet contract
        await new Promise((resolve, reject) => web3.eth.sendTransaction({to: multisigInstance.address, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        const balance = await utils.balanceOf(web3, multisigInstance.address)
        assert.equal(balance.valueOf(), deposit)
    })

    it('transferWithPayloadSizeCheck', async () => {
        // Issue tokens to the multisig address
        const issueResult = await tokenInstance.issueTokens(multisigInstance.address, 1000000, {from: accounts[0]})
        assert.ok(issueResult)
        // Encode transfer call for the multisig
        const transferEncoded = tokenInstance.contract.transfer.getData(accounts[1], 1000000)
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(tokenInstance.address, 0, transferEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')

        const executedTransactionId = utils.getParamFromTxEvent(
            await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]}),
            'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.equals(executedTransactionId))
        // Check that the transfer has actually occured
        assert.equal(
            1000000,
            await tokenInstance.balanceOf(accounts[1])
        )
    })
})
