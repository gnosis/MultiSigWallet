# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
from ethereum.tester import TransactionFailed
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_owner_remove_limit
    """

    HOMESTEAD_BLOCK = 1150000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388

    def test(self):
        # Create wallet
        required_accounts = 1
        wa_1 = 1
        constructor_parameters = (
            [accounts[wa_1]],
            required_accounts
        )
        self.multisig_wallet = self.s.abi_contract(
            open('solidity/MultiSigWallet.sol').read(),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        # Create ABIs
        multisig_abi = self.multisig_wallet.translator
        # Only owner wa_1 cannot be removed, because one owner always has to remain.
        remove_owner_data = multisig_abi.encode("removeOwner", [accounts[wa_1]])
        remove_owner_tx_hash = self.multisig_wallet.submitTransaction(
            self.multisig_wallet.address, 0, remove_owner_data, 0, sender=keys[wa_1])
        # Transaction cannot be executed and remains in pending pool
        include_pending = True
        exclude_executed = False
        self.assertEqual(self.multisig_wallet.getTransactionHashes(0, 1, include_pending, exclude_executed),
                         [remove_owner_tx_hash])
