pragma solidity 0.4.4;
import "MultiSigWallet.sol";


/// @title Multisignature wallet factory - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletFactory {

    event WalletCreation(address sender, address wallet);

    mapping(address => bool) public isWallet;
    mapping(address => address[]) public wallets;

    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @return Returns wallet address.
    function createMultiSigWallet(address[] _owners, uint _required)
        public
        returns (address wallet)
    {
        wallet = address(new MultiSigWallet(_owners, _required));
        isWallet[wallet] = true;
        wallets[msg.sender].push(wallet);
        WalletCreation(msg.sender, wallet);
    }

    /// @dev Returns number of wallets by creator.
    /// @param creator Wallet creator.
    /// @return Returns number of wallets by creator.
    function getWalletCount(address creator)
        public
        constant
        returns (uint)
    {
        return wallets[creator].length;
    }
}
