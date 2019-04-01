# Tests have to be executed separately due to https://github.com/ethereumjs/testrpc/issues/346
truffle compile
run-with-testrpc -d 'truffle test test/javascript/testMultiSigWalletWithDailyLimit.js'
run-with-testrpc -d 'truffle test test/javascript/testMultiSigWalletWithDailyLimitFactory.js'
run-with-testrpc -d 'truffle test test/javascript/testExecutionAfterRequirementsChanged.js'
run-with-testrpc -d 'truffle test test/javascript/testExternalCalls.js'
run-with-testrpc -d 'truffle test test/javascript/testExternalCallsWithDailyLimit.js'
