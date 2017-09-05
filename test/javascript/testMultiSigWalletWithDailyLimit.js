const MultiSigWalletWithDailyLimit = artifacts.require('MultiSigWalletWithDailyLimit')
const web3 = MultiSigWalletWithDailyLimit.web3
const deployMultisig = (owners, confirmations, limit) => {
    return MultiSigWalletWithDailyLimit.new(owners, confirmations, limit)
}

contract('MultiSigWalletWithDailyLimit', (accounts) => {
    let multisigInstance

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1]], 2, 0)
        assert.ok(multisigInstance)
    })

    it('create multisig', async () => {
        const deposit = 10000
        
        await new Promise((resolve, reject) => web3.eth.sendTransaction({to: multisigInstance.address, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        const balance = await new Promise((resolve, reject) => web3.eth.getBalance(multisigInstance.address, (e, balance) => (e ? reject(e) : resolve(balance))))
        assert.equal(balance.valueOf(), deposit)
    })
})