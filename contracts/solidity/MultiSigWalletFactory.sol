pragma solidity 0.4.4;
import "MultiSigWallet.sol";


/// @title Multisignature wallet factory - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletFactory {

    mapping(address => bool) public isWallet;

    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    function createMultiSigWallet(address[] _owners, uint _required)
        public
        returns (address)
    {
        MultiSigWallet wallet = new MultiSigWallet(_owners, _required);
        isWallet[address(wallet)] = true;
        return address(wallet);
    }
}
