pragma solidity 0.4.4;
import "MultiSigWallet.sol";


/// @title Multisignature wallet with daily limit - Allows an owner to withdraw a daily limit without multisig.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimit is MultiSigWallet {

    event DailyLimitChange(uint dailyLimit);
    event Withdraw(address sender, uint amount);

    uint public dailyLimit;
    uint public lastDay;
    uint public spentToday;

    modifier underLimit(uint amount) {
        if (now > lastDay + 24 hours) {
            lastDay = now;
            spentToday = 0;
        }
        spentToday += amount;
        if (spentToday > dailyLimit)
            throw;
        _;
    }

    function changeDailyLimit(uint _dailyLimit)
        external
        onlyWallet
    {
        dailyLimit = _dailyLimit;
        DailyLimitChange(_dailyLimit);
    }

    function withdraw(address destination, uint value)
        external
        ownerExists(msg.sender)
        underLimit(value)
    {
        if (!destination.send(value))
            throw;
        Withdraw(msg.sender, value);
    }

    function MultiSigWalletWithDailyLimit(address[] _owners, uint _required, uint _dailyLimit)
        MultiSigWallet(_owners, _required)
    {
        dailyLimit = _dailyLimit;
    }
}
