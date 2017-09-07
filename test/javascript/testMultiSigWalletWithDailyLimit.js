const MultiSigWalletWithDailyLimit = artifacts.require('MultiSigWalletWithDailyLimit')
const web3 = MultiSigWalletWithDailyLimit.web3
const deployMultisig = (owners, confirmations, limit) => {
    return MultiSigWalletWithDailyLimit.new(owners, confirmations, limit)
}

const utils = require('./utils')

contract('MultiSigWalletWithDailyLimit', (accounts) => {
    let multisigInstance
    const dailyLimit = 3000
    const requiredConfirmations = 2

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1]], requiredConfirmations, dailyLimit)
        assert.ok(multisigInstance)
    })

    it('create multisig', async () => {
        const deposit = 10000
        
        // Send money to wallet contract
        await new Promise((resolve, reject) => web3.eth.sendTransaction({to: multisigInstance.address, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        const balance = await utils.balanceOf(web3, multisigInstance.address)
        assert.equal(balance.valueOf(), deposit)
        assert.equal(dailyLimit, await multisigInstance.dailyLimit())
        assert.equal(dailyLimit, await multisigInstance.calcMaxWithdraw())

        // Withdraw daily limit
        const value1 = 2000
        let owner1Balance = await utils.balanceOf(web3, accounts[0])
        await multisigInstance.submitTransaction(accounts[0], value1, "", {from: accounts[1]})
        assert.equal(
            owner1Balance.add(value1).toString(),
            (await utils.balanceOf(web3, accounts[0])).toString()
        )
        assert.equal(
            balance.sub(value1).toString(),
            (await utils.balanceOf(web3, multisigInstance.address)).toString()
        )

        // Update daily limit
        const dailyLimitUpdated = 2000
        const dailyLimitEncoded = multisigInstance.contract.changeDailyLimit.getData(dailyLimitUpdated)
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(multisigInstance.address, 0, dailyLimitEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')
        
        await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]})
        assert.equal(dailyLimitUpdated, await multisigInstance.dailyLimit())
        assert.equal(0, await multisigInstance.calcMaxWithdraw())

        await utils.increaseTimestamp(web3, 24*3600+1)
        assert.equal(dailyLimitUpdated, (await multisigInstance.calcMaxWithdraw()).toNumber())

        // Withdraw daily limit
        const value2 = 1000
        owner1Balance = await utils.balanceOf(web3, accounts[0])
        await multisigInstance.submitTransaction(accounts[0], value2, "", {from: accounts[1]})
        assert.equal(
            owner1Balance.add(value2).toString(),
            (await utils.balanceOf(web3, accounts[0])).toString()
        )
        assert.equal(
            deposit-value2-value1,
            await utils.balanceOf(web3, multisigInstance.address)
        )
        assert.equal(
            dailyLimitUpdated - value2,
            await multisigInstance.calcMaxWithdraw()
        )
        await multisigInstance.submitTransaction(accounts[0], value2, "", {from: accounts[1]})
        assert.equal(
            owner1Balance.add(value2*2).toString(),
            (await utils.balanceOf(web3, accounts[0])).toString()
        )
        assert.equal(
            deposit-value2*2-value1,
            await utils.balanceOf(web3, multisigInstance.address)
        )
        assert.equal(
            dailyLimitUpdated - value2*2,
            await multisigInstance.calcMaxWithdraw()
        )
    })
})