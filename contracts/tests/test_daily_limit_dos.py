# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_daily_limit_dos
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
        daily_limit = 2000
        wa_1 = 1
        wa_2 = 2
        constructor_parameters = (
            [accounts[wa_1], accounts[wa_2]],
            required_accounts,
            daily_limit
        )
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('MultiSigWalletWithDailyLimit.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters,
            contract_name="MultiSigWalletWithDailyLimit"
        )
        self.fail_account = self.s.abi_contract('contract FailAccount { function () {} }', language='solidity')
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit)
        self.assertEqual(self.multisig_wallet.dailyLimit(), daily_limit)
        # Withdraw daily limit
        value = 2000
        tx_1 = self.multisig_wallet.submitTransaction(self.fail_account.address, value, "", sender=keys[wa_2])
        # Transaction fails and spentToday remains 0
        self.assertFalse(self.multisig_wallet.transactions(tx_1)[3])
        self.assertEqual(self.multisig_wallet.spentToday(), 0)
