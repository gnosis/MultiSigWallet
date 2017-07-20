# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from ethereum.tester import TransactionFailed
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_execution_after_requirements_changed
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
        # Send money to wallet contract
        deposit = 1000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), 1000)
        # Add owner wa_4
        wa_4 = 4
        add_owner_data = multisig_abi.encode('addOwner', [accounts[wa_4]])
        # Only a wallet owner (in this case wa_1) can do this. Owner confirms transaction at the same time.
        transaction_id = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0, add_owner_data,
                                                                  sender=keys[wa_1])
        # There is one pending transaction
        exclude_pending = False
        include_pending = True
        exclude_executed = False
        include_executed = True
        self.assertEqual(
            self.multisig_wallet.getTransactionIds(0, 1, include_pending, exclude_executed), [transaction_id])
        # Update required to 1
        new_required = 1
        update_requirement_data = multisig_abi.encode('changeRequirement', [new_required])
        # Submit successfully
        transaction_id_2 = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0,
                                                                  update_requirement_data, sender=keys[wa_1])
        self.assertEqual(
            self.multisig_wallet.getTransactionIds(0, 2, include_pending, exclude_executed),
            [transaction_id, transaction_id_2])
        # Confirm change requirement transaction
        self.multisig_wallet.confirmTransaction(transaction_id_2, sender=keys[wa_2])
        self.assertEqual(self.multisig_wallet.required(), new_required)
        self.assertEqual(
            self.multisig_wallet.getTransactionIds(0, 1, exclude_pending, include_executed),
            [transaction_id_2])
        # Execution fails, because sender is not wallet owner
        self.assertRaises(TransactionFailed, self.multisig_wallet.executeTransaction, transaction_id, sender=keys[9])
        # Because the # required confirmations changed to 1, the addOwner transaction can be executed now
        self.multisig_wallet.executeTransaction(transaction_id, sender=keys[wa_1])
        self.assertEqual(
            self.multisig_wallet.getTransactionIds(0, 2, exclude_pending, include_executed),
            [transaction_id, transaction_id_2])
