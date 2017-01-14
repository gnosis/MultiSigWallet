pragma solidity 0.4.4;
import "MultiSigWalletWithDailyLimit.sol";


/// @title Multisignature wallet factory for daily limit version - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimitFactory {

    event WalletCreation(address sender, address wallet);

    mapping(address => bool) public isWallet;
    mapping(address => address[]) public wallets;

    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @param _dailyLimit Amount in wei, which can be withdrawn without confirmations on a daily basis.
    /// @return Returns wallet address.
    function createMultiSigWalletWithDailyLimit(address[] _owners, uint _required, uint _dailyLimit)
        public
        returns (address wallet)
    {
        wallet = new MultiSigWalletWithDailyLimit(_owners, _required, _dailyLimit);
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
