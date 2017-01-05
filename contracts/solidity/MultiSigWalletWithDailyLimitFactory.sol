pragma solidity 0.4.4;
import "MultiSigWalletWithDailyLimit.sol";


/// @title Multisignature wallet factory for daily limit version - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimitFactory {

    mapping(address => bool) public isWallet;

    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @param _dailyLimit Amount in wei, which can be withdrawn without confirmations on a daily basis.
    function createMultiSigWalletWithDailyLimit(address[] _owners, uint _required, uint _dailyLimit)
        public
        returns (address)
    {
        MultiSigWalletWithDailyLimit wallet = new MultiSigWalletWithDailyLimit(_owners, _required, _dailyLimit);
        isWallet[address(wallet)] = true;
        return address(wallet);
    }
}
