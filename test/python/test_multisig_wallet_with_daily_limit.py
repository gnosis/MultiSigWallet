# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts, TransactionFailed, ContractCreationFailed
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_multisig_wallet_with_daily_limit
    """

    HOMESTEAD_BLOCK = 1150000
    TWENTY_FOUR_HOURS = 86400  # 24h

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()

    def test(self):
        # Create wallet
        required_accounts = 2
        daily_limit = 3000
        wa_1 = 1
        wa_2 = 2
        wa_3 = 3
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2], accounts[wa_3]],
            required_accounts,
            daily_limit
        )
        gas = self.s.block.gas_used
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('MultiSigWalletWithDailyLimit.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters,
            contract_name="MultiSigWalletWithDailyLimit"
        )
        self.assertLess(self.s.block.gas_used - gas, 2000000)
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit)
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit)
        # Withdraw daily limit
        value_1 = 2000
        wa_1_balance = self.s.block.get_balance(accounts[wa_1])
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_1, "", sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value_1)
        # Update daily limit
        daily_limit_updated = 2000
        update_daily_limit = multisig_abi.encode("changeDailyLimit", [daily_limit_updated])
        transaction_id = self.multisig_wallet.submitTransaction(self.multisig_wallet.address, 0,
                                                                update_daily_limit, sender=keys[wa_1])
        self.multisig_wallet.confirmTransaction(transaction_id, sender=keys[wa_2])
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit_updated)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), 0)
        self.s.block.timestamp += self.TWENTY_FOUR_HOURS + 1
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated)
        # Withdraw daily limit
        value_2 = 1000
        wa_1_balance = self.s.block.get_balance(accounts[wa_1])
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_2, "", sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1 - value_2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value_2)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated - value_2)
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_2, "", sender=keys[wa_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1 - value_2*2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value_2*2)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated - value_2*2)
        # Third time fails, because daily limit was reached
        transaction_id = self.multisig_wallet.submitTransaction(accounts[wa_1], value_2, "", sender=keys[wa_2])
        self.assertFalse(self.multisig_wallet.transactions(transaction_id)[3])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1 - value_2*2)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value_2*2)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), 0)
        # Let one day pass
        self.s.block.timestamp += self.TWENTY_FOUR_HOURS + 1
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated)
        # Execute transaction should work now but fails, because it is triggered from a non owner address
        self.assertRaises(TransactionFailed, self.multisig_wallet.executeTransaction, transaction_id, sender=keys[9])
        # Execute transaction also fails if the sender is a wallet owner but didn't confirm the transaction first
        self.assertRaises(TransactionFailed, self.multisig_wallet.executeTransaction, transaction_id, sender=keys[wa_1])
        # But it works with the right sender
        self.multisig_wallet.executeTransaction(transaction_id, sender=keys[wa_2])
        self.assertTrue(self.multisig_wallet.transactions(transaction_id)[3])
        # Let one day pass
        self.s.block.timestamp += self.TWENTY_FOUR_HOURS + 1
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated)
        # User wants to withdraw more than the daily limit. Withdraw is unsuccessful.
        value_3 = 3000
        wa_1_balance = self.s.block.get_balance(accounts[wa_1])
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_3, "", sender=keys[wa_2])
        # Wallet and user balance remain the same.
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1 - value_2*3)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated)
        # Daily withdraw is possible again
        self.multisig_wallet.submitTransaction(accounts[wa_1], value_2, "", sender=keys[wa_2])
        # Wallet balance decreases and user balance increases.
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value_1 - value_2*4)
        self.assertEqual(self.s.block.get_balance(accounts[wa_1]), wa_1_balance + value_2)
        self.assertEqual(self.multisig_wallet.calcMaxWithdraw(), daily_limit_updated - value_2)
        # Try to execute a transaction tha does not exist fails
        transaction_id = 999
        self.assertRaises(TransactionFailed, self.multisig_wallet.executeTransaction, transaction_id, sender=keys[wa_1])
