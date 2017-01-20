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
        wa_3 = 3
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2], accounts[wa_3]],
            required_accounts
        )
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('MultiSigWallet.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Exchange owner wa_1 with wa_4
        wa_4 = 4
        exchange_owner_data = multisig_abi.encode('replaceOwner', [accounts[wa_1], accounts[wa_4]])
        # Only a wallet owner (in this case wa_1) can do this. Owner confirms transaction at the same time.
        transaction_id = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, exchange_owner_data,
                                                                sender=keys[wa_1])
        # Other owner wa_2 confirms and executes transaction at the same time as min sig are available
        self.assertFalse(self.multisig_wallet.transactions(transaction_id)[3])
        self.multisig_wallet.confirmTransaction(transaction_id, sender=keys[wa_2])
        # Transaction was executed
        self.assertTrue(self.multisig_wallet.transactions(transaction_id)[3])
        # Owner was switched
        self.assertTrue(self.multisig_wallet.isOwner(accounts[wa_4]))
        self.assertFalse(self.multisig_wallet.isOwner(accounts[wa_1]))
