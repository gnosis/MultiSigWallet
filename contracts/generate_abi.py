from ethereum.tester import languages
from tests.preprocessor import PreProcessor
import json
import os

pp = PreProcessor()
contracts = ['MultiSigWallet.sol',
             'MultiSigWalletWithDailyLimit.sol',
             'MultiSigWalletWithPreSign.sol']
contract_dir = 'solidity/'
abi_dir = 'abi'

if not os.path.exists(abi_dir):
    os.makedirs(abi_dir)

for contract_name in contracts:
    code = pp.process(contract_name, add_dev_code=False, contract_dir=contract_dir, replace_unknown_addresses=True)
    compiled = languages["solidity"].combined(code)[-1][1]
    # save abi
    file_name = contract_name.split(".")[0].split("/")[-1]
    h = open("abi/{}.json".format(file_name), "w+")
    h.write(json.dumps({
        'abi': compiled['abi'],
        'bin_hex': compiled['bin_hex']
    }))
    h.close()
    print '{} ABI generated.'.format(file_name)
