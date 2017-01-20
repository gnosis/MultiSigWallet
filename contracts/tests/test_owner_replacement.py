# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from ethereum.tester import TransactionFailed, ContractCreationFailed
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_owner_replacement
    """

    HOMESTEAD_BLOCK = 1150000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()

    def test(self):
        # Create wallet
        required_accounts = 2
        wa_1 = 1
        wa_2 = 2
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2]],
            required_accounts
        )
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('MultiSigWallet.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        self.assertTrue(self.multisig_wallet.isOwner(accounts[wa_1]))
        self.assertTrue(self.multisig_wallet.isOwner(accounts[wa_2]))
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Exchange owner wa_2 with wa_3
        wa_3 = 3
        exchange_owner_data = multisig_abi.encode('replaceOwner', [accounts[wa_2], accounts[wa_3]])
        # Only a wallet owner (in this case wa_1) can do this. Owner confirms transaction at the same time.
        transaction_id = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, exchange_owner_data,
                                                                sender=keys[wa_1])
        # Other owner wa_2 confirms and executes transaction at the same time as min sig are available
        self.assertFalse(self.multisig_wallet.transactions(transaction_id)[3])
        self.assertEqual(self.multisig_wallet.getOwners(), [accounts[wa_1].encode('hex'), accounts[wa_2].encode('hex')])
        self.multisig_wallet.confirmTransaction(transaction_id, sender=keys[wa_2])
        # Transaction was executed
        self.assertTrue(self.multisig_wallet.transactions(transaction_id)[3])
        # Owner was switched
        self.assertFalse(self.multisig_wallet.isOwner(accounts[wa_2]))
        self.assertTrue(self.multisig_wallet.isOwner(accounts[wa_3]))
        self.assertEqual(self.multisig_wallet.getOwners(), [accounts[wa_1].encode('hex'), accounts[wa_3].encode('hex')])
