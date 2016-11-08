# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from bitcoin import ecdsa_raw_sign
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_multisig_wallet_with_pre_sign
    """

    HOMESTEAD_BLOCK = 1150000
    TWENTY_FOUR_HOURS = 86400  # 24h

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()

    def sign_data(self, data, account):
        v, r, s = ecdsa_raw_sign(data, keys[account])
        return self.i2b(v), self.i2b(r), self.i2b(s)

    @staticmethod
    def i2b(_integer, zfill=64):
        return format(_integer, 'x').zfill(zfill).decode('hex')

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
        gas = self.s.block.gas_used
        self.multisig_wallet = self.s.abi_contract(
            self.pp.process('MultiSigWalletWithPreSign.sol', contract_dir='contracts/', add_dev_code=True),
            language='solidity',
            constructor_parameters=constructor_parameters,
            contract_name="MultiSigWalletWithPreSign"
        )
        self.assertLess(self.s.block.gas_used - gas, 2000000)
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], self.multisig_wallet.address, deposit)
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit)
        # Pre sign transaction
        value = 1000
        data = ""
        nonce = 0
        transaction_hash = self.multisig_wallet.calcTransactionHash(accounts[wa_1], value, data, nonce)
        v_1, r_1, s_1 = self.sign_data(transaction_hash, wa_1)
        v_2, r_2, s_2 = self.sign_data(transaction_hash, wa_2)
        self.multisig_wallet.submitTransactionWithSignatures(accounts[wa_1], value, data, nonce, [v_1, v_2],
                                                             [r_1, r_2, s_1, s_2])
        self.assertEqual(self.s.block.get_balance(self.multisig_wallet.address), deposit - value)
