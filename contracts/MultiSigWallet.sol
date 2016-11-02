pragma solidity ^0.4.0;


/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWallet {

    event Confirmation(address sender, bytes32 transactionHash);
    event Revocation(address sender, bytes32 transactionHash);
    event Submission(address sender, bytes32 transactionHash);
    event Execution(address sender, bytes32 transactionHash);
    event Deposit(address sender, uint value);
    event OwnerAddition(address owner);
    event OwnerRemoval(address owner);
    event RequiredUpdate(uint required);

    mapping (bytes32 => Transaction) public transactions;
    mapping (bytes32 => mapping (address => bool)) public confirmations;
    mapping (address => bool) public isOwner;
    address[] public owners;
    uint public required;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        uint nonce;
        bool executed;
    }

    modifier onlyWallet() {
        if (msg.sender != address(this))
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

    modifier maxRequired(address[] _owners, uint _required) {
        if (_required > _owners.length)
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
        owners.push(owner);
        OwnerAddition(owner);
    }

    function removeOwner(address owner)
        external
        onlyWallet
        ownerExists(owner)
    {
        for (uint i=0; i<owners.length - 1; i++) {
            if (owners[i] == owner)
                isOwner[owner] = false;
            if (!isOwner[owner])
                owners[i] = owners[i+1];
        }
        owners.length -= 1;
        if (required > owners.length)
            required = owners.length;
        OwnerRemoval(owner);
    }

    function updateRequired(uint _required)
        external
        onlyWallet
        maxRequired(owners, _required)
    {
        required = _required;
        RequiredUpdate(_required);
    }

    function confirmationCount(bytes32 transactionHash)
        constant
        public
        returns (uint count)
    {
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionHash][owners[i]])
                count += 1;
    }

    function submitTransaction(address destination, uint value, bytes data, uint nonce)
        external
        ownerExists(msg.sender)
        notExecuted(sha3(destination, value, data, nonce))
        returns (bytes32 transactionHash)
    {
        transactionHash = sha3(destination, value, data,  nonce);
        transactions[transactionHash] = Transaction({
            destination: destination,
            value: value,
            data: data,
            nonce: nonce,
            executed: false
        });
        Submission(msg.sender, transactionHash);
        confirmTransaction(transactionHash);
    }

    function confirmTransaction(bytes32 transactionHash)
        public
        ownerExists(msg.sender)
        notExecuted(transactionHash)
    {
        confirmations[transactionHash][msg.sender] = true;
        Confirmation(msg.sender, transactionHash);
        if (confirmationCount(transactionHash) >= required) {
            Transaction tx = transactions[transactionHash];
            tx.executed = true;
            if (!tx.destination.call.value(tx.value)(tx.data))
                throw;
            Execution(msg.sender, transactionHash);
        }
    }

    function revokeConfirmation(bytes32 transactionHash)
        external
        ownerExists(msg.sender)
        notExecuted(transactionHash)
    {
        confirmations[transactionHash][msg.sender] = false;
        Revocation(msg.sender, transactionHash);
    }

    function MultiSigWallet(address[] _owners, uint _required)
        maxRequired(_owners, _required)
    {
        for (uint i=0; i<_owners.length; i++)
            isOwner[_owners[i]] = true;
        required = _required;
        owners = _owners;
    }

    function()
        payable
    {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }
}
