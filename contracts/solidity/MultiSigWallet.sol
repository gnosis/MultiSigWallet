pragma solidity 0.4.4;


/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWallet {

    uint constant public MAX_OWNER_COUNT = 50;

    event Confirmation(address sender, bytes32 transactionHash);
    event Revocation(address sender, bytes32 transactionHash);
    event Submission(bytes32 transactionHash);
    event Execution(bytes32 transactionHash);
    event Deposit(address sender, uint value);
    event OwnerAddition(address owner);
    event OwnerRemoval(address owner);
    event RequirementChange(uint required);

    mapping (bytes32 => Transaction) public transactions;
    mapping (bytes32 => mapping (address => bool)) public confirmations;
    mapping (bytes32 => uint) public nonces;
    mapping (address => bool) public isOwner;
    address[] public owners;
    bytes32[] public transactionHashes;
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

    modifier notNull(address destination) {
        if (destination == 0)
            throw;
        _;
    }

    modifier validNonce(address destination, uint value, bytes data, uint nonce) {
        if (nonce > nonces[keccak256(destination, value, data)])
            throw;
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        if (   ownerCount > MAX_OWNER_COUNT
            || _required > ownerCount
            || _required == 0
            || ownerCount == 0)
            throw;
        _;
    }

    /// @dev Fallback function allows to deposit ether.
    function()
        payable
    {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    function MultiSigWallet(address[] _owners, uint _required)
        public
        validRequirement(_owners.length, _required)
    {
        for (uint i=0; i<_owners.length; i++)
            isOwner[_owners[i]] = true;
        owners = _owners;
        required = _required;
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner)
        public
        onlyWallet
        ownerDoesNotExist(owner)
        validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        OwnerAddition(owner);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner)
        public
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.length -= 1;
        if (required > owners.length)
            changeRequirement(owners.length);
        OwnerRemoval(owner);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint _required)
        public
        onlyWallet
        validRequirement(owners.length, _required)
    {
        required = _required;
        RequirementChange(_required);
    }

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @param nonce Internal transaction nonce to identify transactions with identical arguments.
    /// @return Returns hash identifying a transaction.
    function submitTransaction(address destination, uint value, bytes data, uint nonce)
        public
        returns (bytes32 transactionHash)
    {
        transactionHash = addTransaction(destination, value, data, nonce);
        confirmTransaction(transactionHash);
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionHash Hash identifying a transaction.
    function confirmTransaction(bytes32 transactionHash)
        public
        ownerExists(msg.sender)
    {
        addConfirmation(transactionHash, msg.sender);
        executeTransaction(transactionHash);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionHash Hash identifying a transaction.
    function revokeConfirmation(bytes32 transactionHash)
        public
        ownerExists(msg.sender)
        confirmed(transactionHash, msg.sender)
        notExecuted(transactionHash)
    {
        confirmations[transactionHash][msg.sender] = false;
        Revocation(msg.sender, transactionHash);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionHash Hash identifying a transaction.
    function executeTransaction(bytes32 transactionHash)
        public
        notExecuted(transactionHash)
    {
        if (isConfirmed(transactionHash)) {
            Transaction tx = transactions[transactionHash];
            tx.executed = true;
            if (!tx.destination.call.value(tx.value)(tx.data))
                throw;
            Execution(transactionHash);
        }
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionHash Hash identifying a transaction.
    /// @return Confirmation status.
    function isConfirmed(bytes32 transactionHash)
        public
        constant
        returns (bool)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (confirmations[transactionHash][owners[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }

    /// @dev Returns the nonce for a new transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Internal transaction nonce to identify transactions with identical arguments.
    function getNonce(address destination, uint value, bytes data)
        public
        constant
        returns (uint)
    {
        return nonces[keccak256(destination, value, data)];
    }

    /// @dev Returns number of confirmations of a transaction.
    /// @param transactionHash Hash identifying a transaction.
    /// @return Number of confirmations.
    function getConfirmationCount(bytes32 transactionHash)
        public
        constant
        returns (uint count)
    {
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionHash][owners[i]])
                count += 1;
    }

    /// @dev Returns total number of transactions after filers are applied.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Total number of transactions after filters are applied.
    function getTransactionCount(bool pending, bool executed)
        public
        constant
        returns (uint count)
    {
        for (uint i=0; i<transactionHashes.length; i++)
            if (   pending && !transactions[transactionHashes[i]].executed
                || executed && transactions[transactionHashes[i]].executed)
                count += 1;
    }

    /*
     * Internal functions
     */
    /// @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @param nonce Internal transaction nonce to identify transactions with identical arguments.
    /// @return Returns hash identifying transaction.
    function addTransaction(address destination, uint value, bytes data, uint nonce)
        internal
        notNull(destination)
        validNonce(destination, value, data, nonce)
        returns (bytes32 transactionHash)
    {
        transactionHash = keccak256(destination, value, data, nonce);
        if (transactions[transactionHash].destination == 0) {
            transactions[transactionHash] = Transaction({
                destination: destination,
                value: value,
                data: data,
                nonce: nonce,
                executed: false
            });
            nonces[keccak256(destination, value, data)] += 1;
            transactionHashes.push(transactionHash);
            Submission(transactionHash);
        }
    }

    /// @dev Adds a confirmation from an owner for a transaction.
    /// @param transactionHash Hash identifying a transaction.
    /// @param owner Address of owner.
    function addConfirmation(bytes32 transactionHash, address owner)
        internal
        notConfirmed(transactionHash, owner)
    {
        confirmations[transactionHash][owner] = true;
        Confirmation(owner, transactionHash);
    }

    /*
     * Web3 functions
     */
    /// @dev Returns list of owners.
    /// @return List of owner addresses.
    function getOwners()
        public
        constant
        returns (address[] _owners)
    {
        _owners = new address[](owners.length);
        for (uint i=0; i<owners.length; i++)
            _owners[i] = owners[i];
    }

    /// @dev Returns array with owner addresses, which confirmed transaction.
    /// @param transactionHash Hash identifying a transaction.
    /// @return Returns array of owner addresses.
    function getConfirmations(bytes32 transactionHash)
        public
        constant
        returns (address[] _confirmations)
    {
        address[] memory confirmationsTemp = new address[](owners.length);
        uint count = 0;
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionHash][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        _confirmations = new address[](count);
        for (i=0; i<count; i++)
            _confirmations[i] = confirmationsTemp[i];
    }

    /// @dev Returns list of transaction hashes in defined range.
    /// @param from Index start position of transaction array.
    /// @param to Index end position of transaction array.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Returns array of transaction hashes.
    function getTransactionHashes(uint from, uint to, bool pending, bool executed)
        public
        constant
        returns (bytes32[] _transactionHashes)
    {
        bytes32[] memory transactionHashesTemp = new bytes32[](transactionHashes.length);
        uint count = 0;
        for (uint i=0; i<transactionHashes.length; i++)
            if (   pending && !transactions[transactionHashes[i]].executed
                || executed && transactions[transactionHashes[i]].executed)
            {
                transactionHashesTemp[count] = transactionHashes[i];
                count += 1;
            }
        _transactionHashes = new bytes32[](to - from);
        for (i=from; i<to; i++)
            _transactionHashes[i - from] = transactionHashesTemp[i];
    }
}
