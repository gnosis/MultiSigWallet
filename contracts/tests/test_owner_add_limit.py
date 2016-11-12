# ethereum
from ethereum import tester as t
from ethereum.utils import sha3, privtoaddr, to_string
from ethereum.tester import ContractCreationFailed
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest contracts.tests.test_owner_add_limit
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
        self.assertRaises(ContractCreationFailed, self.s.abi_contract,
                          open('solidity/MultiSigWallet.sol').read(),
                          language='solidity', constructor_parameters=(accounts + accounts[:1], required_accounts))
        gas = self.s.block.gas_used
        self.multisig_wallet = self.s.abi_contract(
            open('solidity/MultiSigWallet.sol').read(),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        self.assertLess(self.s.block.gas_used - gas, 3500000)
        # Validate deployment
        self.assertEqual(self.multisig_wallet.required(), required_accounts)
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator

        # Breach the maximum number of owners
        key_51 = sha3(to_string(51))
        account_51 = privtoaddr(key_51)
        add_owner_data = multisig_abi.encode("addOwner", [account_51])
        self.assertFalse(self.multisig_wallet.isOwner(account_51))
        nonce = self.multisig_wallet.getNonce(self.multisig_wallet.address, 0, add_owner_data)
        add_owner_tx_hash = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, add_owner_data,
                                                                    nonce, sender=keys[0])
        self.assertEqual(self.multisig_wallet.getPendingTransactions(), [add_owner_tx_hash])
        self.assertEqual(self.multisig_wallet.getExecutedTransactions(), [])
        for i in range(1, account_count):
            profiling = self.multisig_wallet.confirmTransaction(add_owner_tx_hash, sender=keys[i], profiling=True)
            # self.assertLess(profiling['gas'], 100000)
        self.assertEqual(self.multisig_wallet.getPendingTransactions(), [])
        self.assertEqual(self.multisig_wallet.getExecutedTransactions(),
                         [add_owner_tx_hash])
        # Transaction was successfully processed
        self.assertTrue(self.multisig_wallet.isOwner(account_51))
