pragma solidity ^0.4.0;


/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWallet {

    event Confirmation(address sender, bytes32 transactionHash);
    event Revocation(address sender, bytes32 transactionHash);
    event Submission(bytes32 transactionHash);
    event Execution(bytes32 transactionHash);
    event Deposit(address sender, uint value);
    event OwnerAddition(address owner);
    event OwnerRemoval(address owner);
    event RequiredUpdate(uint required);

    mapping (bytes32 => Transaction) public transactions;
    mapping (bytes32 => mapping (address => bool)) public confirmations;
    mapping (address => bool) public isOwner;
    uint public ownerCount;
    uint public required;
    bytes32[] transactionList;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        uint nonce;
        uint confirmations;
        bool executed;
    }

    modifier onlyWallet() {
        if (msg.sender != address(this))
            throw;
        _;
    }

    modifier signaturesFromOwners(bytes32 transactionHash, uint8[] v, bytes32[] rs) {
        for (uint i=0; i<v.length; i++)
            if (!isOwner[ecrecover(transactionHash, v[i], rs[i], rs[v.length + i])])
                throw;
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        if (isOwner[owner])
            throw;
        _;
    }

    modifier ownerExists(address owner) {
        if (!isOwner[owner])
            throw;
        _;
    }

    modifier checkRequired(uint _ownerCount, uint _required) {
        if (_required > _ownerCount || _required == 0 || _ownerCount == 0)
            throw;
        _;
    }

    modifier confirmed(bytes32 transactionHash, address owner) {
        if (!confirmations[transactionHash][owner])
            throw;
        _;
    }

    modifier notConfirmed(bytes32 transactionHash, address owner) {
        if (confirmations[transactionHash][owner])
            throw;
        _;
    }

    modifier notExecuted(bytes32 transactionHash) {
        if (transactions[transactionHash].executed)
            throw;
        _;
    }

    function addOwner(address owner)
        external
        onlyWallet
        ownerDoesNotExist(owner)
    {
        isOwner[owner] = true;
        ownerCount += 1;
        OwnerAddition(owner);
    }

    function removeOwner(address owner)
        external
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        ownerCount -= 1;
        if (required > ownerCount)
            updateRequired(ownerCount);
        OwnerRemoval(owner);
    }

    function updateRequired(uint _required)
        public
        onlyWallet
        checkRequired(ownerCount, _required)
    {
        required = _required;
        RequiredUpdate(_required);
    }

    function addTransaction(address destination, uint value, bytes data, uint nonce)
        private
        returns (bytes32 transactionHash)
    {
        transactionHash = sha3(destination, value, data,  nonce);
        if (transactions[transactionHash].confirmations == 0) {
            transactions[transactionHash] = Transaction({
                destination: destination,
                value: value,
                data: data,
                nonce: nonce,
                confirmations: 0,
                executed: false
            });
            transactionList.push(transactionHash);
            Submission(transactionHash);
        }
    }

    function submitTransaction(address destination, uint value, bytes data, uint nonce)
        external
        ownerExists(msg.sender)
        notExecuted(sha3(destination, value, data, nonce))
        returns (bytes32 transactionHash)
    {
        transactionHash = addTransaction(destination, value, data,  nonce);
        confirmTransaction(transactionHash);
    }

    function submitTransactionWithSignatures(address destination, uint value, bytes data, uint nonce, uint8[] v, bytes32[] rs)
        external
        signaturesFromOwners(sha3(destination, value, data, nonce), v, rs)
        notExecuted(sha3(destination, value, data, nonce))
        returns (bytes32 transactionHash)
    {
        transactionHash = addTransaction(destination, value, data,  nonce);
        confirmTransactionWithSignatures(transactionHash, v, rs);
    }

    function addConfirmation(bytes32 transactionHash, address owner)
        private
    {
        confirmations[transactionHash][owner] = true;
        Transaction tx = transactions[transactionHash];
        tx.confirmations += 1;
        Confirmation(owner, transactionHash);
    }

    function confirmTransaction(bytes32 transactionHash)
        public
        ownerExists(msg.sender)
        notExecuted(transactionHash)
        notConfirmed(transactionHash, msg.sender)
    {
        addConfirmation(transactionHash, msg.sender);
        executeTransaction(transactionHash);
    }

    function confirmTransactionWithSignatures(bytes32 transactionHash, uint8[] v, bytes32[] rs)
        public
        signaturesFromOwners(transactionHash, v, rs)
        notExecuted(transactionHash)
    {
        for (uint i=0; i<v.length; i++) {
            address owner = ecrecover(transactionHash, v[i], rs[i], rs[i + v.length]);
            if (!confirmations[transactionHash][owner])
                addConfirmation(transactionHash, owner);
        }
        executeTransaction(transactionHash);
    }

    function executeTransaction(bytes32 transactionHash)
        private
    {
        Transaction tx = transactions[transactionHash];
        if (tx.confirmations >= required) {
            tx.executed = true;
            if (!tx.destination.call.value(tx.value)(tx.data))
                throw;
            Execution(transactionHash);
        }
    }

    function revokeConfirmation(bytes32 transactionHash)
        external
        ownerExists(msg.sender)
        notExecuted(transactionHash)
        confirmed(transactionHash, msg.sender)
    {
        confirmations[transactionHash][msg.sender] = false;
        Transaction tx = transactions[transactionHash];
        tx.confirmations -= 1;
        Revocation(msg.sender, transactionHash);
    }

    function MultiSigWallet(address[] _owners, uint _required)
        checkRequired(_owners.length, _required)
    {
        for (uint i=0; i<_owners.length; i++)
            isOwner[_owners[i]] = true;
        ownerCount = _owners.length;
        required = _required;
    }

    function()
        payable
    {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }

    function filterTransactions(bool isPending)
        private
        returns (bytes32[] _transactionList)
    {
        uint count = 0;
        for (uint i=0; i<transactionList.length; i++)
            if (   isPending && !transactions[transactionList[i]].executed
                || !isPending && transactions[transactionList[i]].executed)
                count += 1;
        _transactionList = new bytes32[](count);
        count = 0;
        for (i=0; i<transactionList.length; i++)
            if (   isPending && !transactions[transactionList[i]].executed
                || !isPending && transactions[transactionList[i]].executed)
            {
                _transactionList[count] = transactionList[i];
                count += 1;
            }
    }

    function getPendingTransactions()
        external
        constant
        returns (bytes32[] _transactionList)
    {
        return filterTransactions(true);
    }

    function getExecutedTransactions()
        external
        constant
        returns (bytes32[] _transactionList)
    {
        return filterTransactions(false);
    }
}
