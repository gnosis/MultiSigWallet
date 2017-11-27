pragma solidity 0.4.18;
import "./Factory.sol";
import "./MultiSigWallet.sol";


/// @title Multisignature wallet factory - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletFactory is Factory {

    /*
     * Public functions
     */
    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @return Returns wallet address.
    function create(address _tokenContract, address[] _owners, uint _required)
        public
        returns (address wallet)
    {
        wallet = new MultiSigWallet(_tokenContract, _owners, _required);
        register(wallet);
    }
}
