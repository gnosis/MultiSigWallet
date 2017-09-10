const MultiSigWalletWithDailyLimit = artifacts.require('MultiSigWalletWithDailyLimit')
const MultiSigWalletWithDailyLimitFactory = artifacts.require('MultiSigWalletWithDailyLimitFactory')
const web3 = MultiSigWalletWithDailyLimitFactory.web3

const utils = require('./utils')

contract('MultiSigWalletWithDailyLimitFactory', (accounts) => {
    let factoryInstance
    const dailyLimit = 3000
    const requiredConfirmations = 2

    beforeEach(async () => {
        // [accounts[0], accounts[1]], requiredConfirmations, dailyLimit
        factoryInstance = await MultiSigWalletWithDailyLimitFactory.new()
        assert.ok(factoryInstance)
    })

    it('Multisig Factory', async () => {
        // Create factory
        const tx = await factoryInstance.create([accounts[0], accounts[1]], requiredConfirmations, dailyLimit)
        const walletAddress = utils.getParamFromTxEvent(tx, 'instantiation', null, 'ContractInstantiation')

        const walletCount = await factoryInstance.getInstantiationCount(accounts[0])
        const multisigWalletAddressConfirmation = await factoryInstance.instantiations(accounts[0], walletCount.sub(1).toNumber())
        assert.equal(walletAddress, multisigWalletAddressConfirmation)
        assert.ok(factoryInstance.isInstantiation(walletAddress))

        // Send money to wallet contract
        const multisigInstance = MultiSigWalletWithDailyLimit.at(walletAddress)
        const deposit = 10000
        await new Promise((resolve, reject) => web3.eth.sendTransaction({to: walletAddress, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        const balance = await utils.balanceOf(web3, walletAddress)        
        assert.equal(balance.valueOf(), deposit)
        assert.equal(dailyLimit, await multisigInstance.dailyLimit())
        assert.equal(dailyLimit, await multisigInstance.calcMaxWithdraw())
        
        // Update daily limit
        const dailyLimitUpdated = 2000
        const dailyLimitEncoded = multisigInstance.contract.changeDailyLimit.getData(dailyLimitUpdated)
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(multisigInstance.address, 0, dailyLimitEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission'
        )        

        await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]})
        assert.equal(dailyLimitUpdated, (await multisigInstance.dailyLimit()).toNumber())
        assert.equal(dailyLimitUpdated, (await multisigInstance.calcMaxWithdraw()).toNumber())
    })
})