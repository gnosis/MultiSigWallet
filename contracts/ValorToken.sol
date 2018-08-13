pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardBurnableToken.sol";

/**
 * @title ValorToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract ValorToken is StandardBurnableToken {
  string public constant name    =   "ValorToken";
  string public constant symbol  =   "VALOR";
  uint8 public constant decimals =   18;

  // initial supply addresses
  address public employeePool;
  address public futureDevFund;
  address public companyWallet;

  // initial supply and distribution of tokens
  uint256 internal constant decMultiplier = 10 ** uint256(decimals);
  uint256 public constant INITIAL_SUPPLY = 1e8 * decMultiplier; //100000000 VALOR.
  // distribution is:
  // employeePool : 19%
  // futureDevFund: 26%
  // companyWallet: 55%
  uint256 internal constant employeePoolSupply = 1.9e7 * decMultiplier; // 19000000 VALOR
  uint256 internal constant futureDevFundSupply = 2.6e7 * decMultiplier; // 26000000 VALOR
  uint256 internal constant companyWalletSupply = 5.5e7 * decMultiplier; // 55000000 VALOR

  /**
   * @dev Constructor that distributes the supply among Employee pool,
   * @dev Future Dev fund and SmartValor Company.
   */
  constructor(address _employeePool, address _futureDevFund, address _companyWallet) public {
    require(_employeePool != address(0));
    require(_futureDevFund != address(0));
    require(_companyWallet != address(0));

    employeePool  = _employeePool;
    futureDevFund = _futureDevFund;
    companyWallet = _companyWallet;

    totalSupply_ = INITIAL_SUPPLY;

    // EmployeePool
    balances[employeePool] = employeePoolSupply;
    emit Transfer(address(0), employeePool, employeePoolSupply);

    // FutureDevFund
    balances[futureDevFund] = futureDevFundSupply;
    emit Transfer(address(0), futureDevFund, futureDevFundSupply);

    //CompanyWallet
    balances[companyWallet] = companyWalletSupply;
    emit Transfer(address(0), companyWallet, companyWalletSupply);
  }
}
