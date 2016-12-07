# ethereum
from ethereum import tester as t
from ethereum.tester import keys, accounts
# standard libraries
from unittest import TestCase


class TestContract(TestCase):
    """
    run test with python -m unittest tests.test_token_transfer
    """

    HOMESTEAD_BLOCK = 1150000

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.s = t.state()
        self.s.block.number = self.HOMESTEAD_BLOCK
        t.gas_limit = 4712388

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
            open('solidity/MultiSigWallet.sol').read(),
            language='solidity',
            constructor_parameters=constructor_parameters
        )
        # Create token
        self.test_token = self.s.abi_contract(
            open('solidity/TestToken.sol').read(),
            language='solidity'
        )
        # Create ABIs
        test_token_abi = self.test_token.translator
        # Assign tokens to multisig
        token_count = 10000
        self.test_token.issueTokens(self.multisig_wallet.address, token_count)
        self.assertEqual(self.test_token.balanceOf(self.multisig_wallet.address), token_count)
        # Multisig wallet sends tokens to wa_1
        transfer_data = test_token_abi.encode("transfer", [accounts[wa_1], token_count/2])
        nonce = self.multisig_wallet.getNonce(self.test_token.address, 0, transfer_data)
        transaction_hash = self.multisig_wallet.submitTransaction(self.test_token.address, 0, transfer_data, nonce,
                                                                  sender=keys[wa_1])
        include_pending = True
        exclude_executed = False
        self.assertEqual(self.multisig_wallet.getTransactions(0, 1, include_pending, exclude_executed),
                         [transaction_hash])
        self.assertTrue(self.multisig_wallet.confirmations(transaction_hash, accounts[wa_1]))
        self.assertEqual(self.multisig_wallet.getConfirmationCount(transaction_hash), 1)
        self.multisig_wallet.confirmTransaction(transaction_hash, sender=keys[wa_2])
        self.assertEqual(self.multisig_wallet.getConfirmationCount(transaction_hash), 2)
        self.assertEqual(self.test_token.balanceOf(self.multisig_wallet.address), token_count/2)
        self.assertEqual(self.test_token.balanceOf(accounts[wa_1]), token_count/2)
