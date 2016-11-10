pragma solidity 0.4.4;
import "MultiSigWallet.sol";


/// @title Multisignature wallet with daily limit - Allows an owner to withdraw a daily limit without multisig.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimit is MultiSigWallet {

    event DailyLimitChange(uint dailyLimit);

    uint public dailyLimit;
    uint public lastDay;
    uint public spentToday;

    function underLimit(uint amount)
        private
        returns (bool)
    {
        if (now > lastDay + 24 hours) {
            lastDay = now;
            spentToday = 0;
        }
        if (spentToday + amount > dailyLimit)
            return false;
        spentToday += amount;
        return true;
    }

    function changeDailyLimit(uint _dailyLimit)
        external
        onlyWallet
    {
        dailyLimit = _dailyLimit;
        DailyLimitChange(_dailyLimit);
    }

    function executeTransaction(bytes32 transactionHash)
        public
        notExecuted(transactionHash)
    {
        Transaction tx = transactions[transactionHash];
        if (isConfirmed(transactionHash) || tx.data.length == 0 && underLimit(tx.value)) {
            tx.executed = true;
            if (!tx.destination.call.value(tx.value)(tx.data))
                throw;
            Execution(transactionHash);
        }
    }

    function MultiSigWalletWithDailyLimit(address[] _owners, uint _required, uint _dailyLimit)
        MultiSigWallet(_owners, _required)
    {
        dailyLimit = _dailyLimit;
    }
}
