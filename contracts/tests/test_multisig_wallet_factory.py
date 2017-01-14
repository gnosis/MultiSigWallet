# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from preprocessor import PreProcessor
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_multisig_wallet_factory
    """

    HOMESTEAD_BLOCK = 1150000
    TWENTY_FOUR_HOURS = 86400  # 24h

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388
        self.pp = PreProcessor()
        self.multisig_abi = self.s.abi_contract(
            self.pp.process('MultiSigWallet.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            constructor_parameters=([accounts[0]], 1),
            contract_name="MultiSigWallet"
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
            self.pp.process('MultiSigWalletFactory.sol', contract_dir='solidity/', add_dev_code=True),
            language='solidity',
            contract_name="MultiSigWalletFactory"
        )
        self.assertLess(self.s.block.gas_used - gas, 2000000)
        print "Deployment costs: {}".format(self.s.block.gas_used - gas)
        # Create wallet
        required_accounts = 2
        wa_1 = 1
        wa_2 = 2
        wa_3 = 3
        multisig_wallet_address = self.multisig_wallet_factory.createMultiSigWallet([accounts[wa_1], accounts[wa_2], accounts[wa_3]], required_accounts)
        self.assertTrue(self.multisig_wallet_factory.isWallet(multisig_wallet_address))
        wallet_count = self.multisig_wallet_factory.getWalletCount(accounts[0])
        multisig_wallet_address_confirmation = self.multisig_wallet_factory.wallets(accounts[0], wallet_count - 1)
        self.assertEqual(multisig_wallet_address, multisig_wallet_address_confirmation)
        # Send money to wallet contract
        deposit = 10000
        self.s.send(keys[wa_1], multisig_wallet_address, deposit)
        self.assertEqual(self.s.block.get_balance(multisig_wallet_address), deposit)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "required"), required_accounts)
        # Update required
        required_update = 3
        update_required = self.multisig_abi.encode("changeRequirement", [required_update])
        transaction_hash = self.multisig_transaction(multisig_wallet_address,
                                                     "submitTransaction",
                                                     (multisig_wallet_address, 0,  update_required, 0),
                                                     wa_1)
        self.multisig_transaction(multisig_wallet_address,
                                  "confirmTransaction",
                                  (transaction_hash, ),
                                  wa_2)
        self.assertEqual(self.multisig_transaction(multisig_wallet_address, "required"), required_update)
