# ethereum
from ethereum import tester as t
from ethereum.utils import sha3, privtoaddr, to_string
from ethereum.tester import ContractCreationFailed
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_owner_count
    """

    HOMESTEAD_BLOCK = 1150000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388

    def test(self):
        # Create 50 accounts
        accounts = []
        keys = []
        account_count = 50
        for i in range(account_count):
            keys.append(sha3(to_string(i)))
            accounts.append(privtoaddr(keys[-1]))
            self.s.block.set_balance(accounts[-1], 10**18)
        # Create wallet
        required_accounts = account_count
        constructor_parameters = (
            accounts,
            required_accounts
        )
        # Try to create contract with 51 owners fails
        self.assertRaises(ContractCreationFailed, self.s.abi_contract, open('contracts/MultiSigWallet.sol').read(),
                          language='solidity', constructor_parameters=(accounts + accounts[:1], required_accounts))
        gas = self.s.block.gas_used
        self.multisig_wallet = self.s.abi_contract(
            open('contracts/MultiSigWallet.sol').read(),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        self.assertLess(self.s.block.gas_used - gas, 3500000)
        # Validate deployment
        self.assertEqual(self.multisig_wallet.required(), required_accounts)
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Send money to wallet contract
        deposit = 1000
        self.s.send(keys[0], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), 1000)
        # Transfer money from wallet
        transaction_hash = self.multisig_wallet.submitTransaction(accounts[0], deposit, "", 0, sender=keys[0])
        self.assertEqual(self.multisig_wallet.getPendingTransactions(), [transaction_hash])
        for i in range(1, account_count):
            self.multisig_wallet.confirmTransaction(transaction_hash, sender=keys[i])
        # Transaction was executed
        self.assertTrue(self.multisig_wallet.transactions(transaction_hash)[4])
        self.assertEqual(self.multisig_wallet.getExecutedTransactions(), [transaction_hash])
        # Delete owner wa_3. All parties have to confirm.
        remove_owner_data = multisig_abi.encode("removeOwner", [accounts[account_count - 1]])
        transaction_hash_2 = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, remove_owner_data,
                                                                    0, sender=keys[0])
        self.assertEqual(self.multisig_wallet.getPendingTransactions(), [transaction_hash_2])
        self.assertEqual(self.multisig_wallet.getExecutedTransactions(), [transaction_hash])
        for i in range(1, account_count):
            profiling = self.multisig_wallet.confirmTransaction(transaction_hash_2, sender=keys[i], profiling=True)
            self.assertLess(profiling['gas'], 100000)
        self.assertEqual(self.multisig_wallet.getPendingTransactions(), [])
        self.assertEqual(self.multisig_wallet.getExecutedTransactions(),
                         [transaction_hash, transaction_hash_2])
        # Transaction was successfully processed
        self.assertEqual(self.multisig_wallet.required(), required_accounts - 1)
