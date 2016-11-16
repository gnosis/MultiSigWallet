pragma solidity 0.4.4;
import "MultiSigWallet.sol";


/// @title Multisignature wallet with pre-sign functionality - Allows multiple parties to pre-sign transactions.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithPreSign is MultiSigWallet {

    modifier signaturesFromOwners(bytes32 transactionHash, uint8[] v, bytes32[] rs) {
        for (uint i=0; i<v.length; i++)
            if (!isOwner[ecrecover(transactionHash, v[i], rs[i], rs[v.length + i])])
                throw;
        _;
    }

    function MultiSigWalletWithPreSign(address[] _owners, uint _required)
        public
        MultiSigWallet(_owners, _required)
    {
        // Nothing to do here
    }

    function submitTransactionPreSigned(address destination, uint value, bytes data, uint nonce, uint8[] v, bytes32[] rs)
        public
        returns (bytes32 transactionHash)
    {
        transactionHash = addTransaction(destination, value, data, nonce);
        confirmTransactionPreSigned(transactionHash, v, rs);
    }

    function confirmTransactionPreSigned(bytes32 transactionHash, uint8[] v, bytes32[] rs)
        public
        signaturesFromOwners(transactionHash, v, rs)
    {
        for (uint i=0; i<v.length; i++)
            addConfirmation(transactionHash, ecrecover(transactionHash, v[i], rs[i], rs[i + v.length]));
        executeTransaction(transactionHash);
    }

    function calcTransactionHash(address destination, uint value, bytes data, uint nonce)
        public
        constant
        returns (bytes32 transactionHash)
    {
        return keccak256(destination, value, data, nonce);
    }
}
