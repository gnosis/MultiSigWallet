# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from ethereum.tester import TransactionFailed, ContractCreationFailed
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_add_null_owner
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
        # Contract creation fails because we want to add 0 address as owner
        constructor_parameters = (
            [accounts[wa_1], 0],
            required_accounts
        )
        self.assertRaises(ContractCreationFailed,
                          self.s.abi_contract,
                          self.pp.process('MultiSigWallet.sol', contract_dir='solidity/', add_dev_code=True),
                          language='solidity',
                          constructor_parameters=constructor_parameters)
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
        # Add null owner
        add_owner_data = multisig_abi.encode('addOwner', [0])
        # A third party cannot submit transactions.
        self.assertRaises(TransactionFailed, self.multisig_wallet.submitTransaction, self.multisig_wallet.address, 0,
                          add_owner_data, sender=keys[0])
        # Wallet owner tries to submit transaction with destination address 0 but fails. 0 address is not allowed.
        self.assertRaises(
            TransactionFailed, self.multisig_wallet.submitTransaction, 0, 0, add_owner_data, sender=keys[wa_1])
        # Only a wallet owner (in this case wa_1) can do this. Owner confirms transaction at the same time.
        transaction_id = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, add_owner_data,
                                                                sender=keys[wa_1])
        # Other owner wa_2 confirms and executes transaction at the same time as min sig are available
        self.assertFalse(self.multisig_wallet.transactions(transaction_id)[3])
        self.multisig_wallet.confirmTransaction(transaction_id, sender=keys[wa_2])
        self.assertEqual(self.multisig_wallet.getConfirmationCount(transaction_id), 2)
        self.assertEqual(self.multisig_wallet.getConfirmations(transaction_id),
                         [accounts[wa_1].encode('hex'), accounts[wa_2].encode('hex')])
        # Transaction was not executed, as the null owner could not be added
        self.assertFalse(self.multisig_wallet.transactions(transaction_id)[3])
