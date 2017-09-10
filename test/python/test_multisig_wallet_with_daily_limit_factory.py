# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_multisig_wallet_with_daily_limit_factory
    """

    HOMESTEAD_BLOCK = 1150000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()
        self.multisig_abi = self.s.abi_contract(
            self.pp.process('MultiSigWalletWithDailyLimit.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=([accounts[0]], 1, 0),
            contract_name="MultiSigWalletWithDailyLimit"
        ).translator

    def multisig_transaction(self, contract_address, func_name, params=(), sender=0):
        result = self.multisig_abi.decode(
            func_name,
            self.s.send(
                keys[sender], contract_address, 0, self.multisig_abi.encode(func_name, params)
            )
        )
        return result[0] if len(result) == 1 else result

    def test(self):
        # Create factory
        gas = self.s.block.gas_used
        self.multisig_wallet_factory = self.s.abi_contract(
            self.pp.process('MultiSigWalletWithDailyLimitFactory.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            contract_name="MultiSigWalletWithDailyLimitFactory"
        )
        self.assertLess(self.s.block.gas_used - gas, 2500000)
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        # Create wallet
        required_accounts = 2
        daily_limit = 1000
        wa_1 = 1
        wa_2 = 2
        wa_3 = 3
        multisig_wallet_address = self.multisig_wallet_factory.create([accounts[wa_1], accounts[wa_2], accounts[wa_3]],
                                                                      required_accounts,
                                                                      daily_limit)
        wallet_count = self.multisig_wallet_factory.getInstantiationCount(accounts[0])
        multisig_wallet_address_confirmation = self.multisig_wallet_factory.instantiations(accounts[0], wallet_count-1)
        self.assertEqual(multisig_wallet_address, multisig_wallet_address_confirmation)
        self.assertTrue(self.multisig_wallet_factory.isInstantiation(multisig_wallet_address))
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], multisig_wallet_address, deposit)
        self.assertEqual(self.s.block.get_balance(multisig_wallet_address), deposit)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "dailyLimit"), daily_limit)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "calcMaxWithdraw"), daily_limit)
        # Update daily limit
        daily_limit_updated = 2000
        update_daily_limit = self.multisig_abi.encode("changeDailyLimit", [daily_limit_updated])
        transaction_id = self.multisig_transaction(multisig_wallet_address,
                                                   "submitTransaction",
                                                   (multisig_wallet_address, 0,  update_daily_limit),
                                                   wa_1)
        self.multisig_transaction(multisig_wallet_address,
                                  "confirmTransaction",
                                  (transaction_id, ),
                                  wa_2)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "dailyLimit"), daily_limit_updated)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "calcMaxWithdraw"), daily_limit_updated)
