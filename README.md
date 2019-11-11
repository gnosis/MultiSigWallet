Ethereum Multisignature Wallet
===================

[![Join the chat at https://gitter.im/gnosis/MultiSigWallet](https://badges.gitter.im/gnosis/MultiSigWallet.svg)](https://gitter.im/gnosis/MultiSigWallet?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The purpose of multisig wallets is to increase security by requiring multiple parties to agree on transactions before execution. Transactions can be executed only when confirmed by a predefined number of owners. A web user interface can be found [here](/dapp).

**NOTE:** Not compatible with current NodeJS LTS. Recommended NodeJS version is v6.17.1 (last LTS for v6).

Features
-------------

- Can hold Ether and all kind of tokens with multisig support
- Easy to use offline signing (cold wallet) support
- Integration with web3 wallets (Metamask, Mist, Parity, etc)
- Transaction data and log decoding, makes transactions more readable
- Interacting with any contracts with UI support
- Hardware wallet support (Ledger Wallet)
- Optional email notifications when an event is triggered or you are required to sign a transaction

Being used by
-------------
- [Aragon](https://aragon.one/)
- [Bancor](https://www.bancor.network/)
- Brace
- [District0x](https://district0x.io/)
- [Golem](https://golem.network/)
- [MysteriumNetwork](https://mysterium.network/)
- [Weifund](http://weifund.io/)
- StabL

Install
-------------
```
# For Ubuntu/Debian you need to install libusb development headers
apt install -y libusb-1.0-0-dev

git clone https://github.com/gnosis/MultiSigWallet.git
cd MultiSigWallet

# Latest NodeJS (v12.13.0) does NOT appear to work correctly.
# You should use NVM and install Node v6.17.1 for best results: https://github.com/nvm-sh/nvm
# Tested by @Privex on 2019-Nov-06 with v6.17.1 with success
nvm install v6.17.1

# node-gyp is required for 'npm install' to work correctly
npm install node-gyp

npm install
```

Test
-------------
### Run contract tests:
```
npm test
```
### Run interface tests:
```
npm run test-dapp
```

Deploy Contracts
-------------
### Deploy multisig wallet:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations>
```
### Deploy multisig wallet with daily limit:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations> <dailyLimit>
```

Deployed instances with significant funds
-------------
- Aragon [0xcafe1a77e84698c83ca8931f54a755176ef75f2c](https://etherscan.io/address/0xcafe1a77e84698c83ca8931f54a755176ef75f2c)
- Bancor [0x5894110995b8c8401bd38262ba0c8ee41d4e4658](https://etherscan.io/address/0x5894110995b8c8401bd38262ba0c8ee41d4e4658)
- Golem [0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9](https://etherscan.io/address/0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9)
- MysteriumDev [0x7e6614722614e434c4df9901bab31e466ba12fa4](https://etherscan.io/address/0x7e6614722614e434c4df9901bab31e466ba12fa4)
- District0x [0xd20e4d854c71de2428e1268167753e4c7070ae68](https://etherscan.io/address/0xd20e4d854c71de2428e1268167753e4c7070ae68)

Interface Releases
------------------
You can find binaries for OSX, Windows and Linux [here](https://github.com/gnosis/MultiSigWallet/releases)

Limitations
-------------
This implementation does not allow the creation of smart contracts via multisignature transactions.
Transactions to address 0 cannot be done. Any other transaction can be done.

Security
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------------
[LGPL v3](./LICENSE)

FAQ
-------------
### How to set a custom Ethereum Node?
You can specify a custom Ethereum Node endpoint by going to `settings` page. Click on `Ethereum Node` dropdown menu and select `Custom configuration`, this would make the Ethereum node's field editable. Please write your new endpoint there. Remember, if `Web3 Provider` is set to `Default (Metamask, Mist, Parity)`, Multisig will use the Ethereum Node endpoint coming with the Web3 Provider, so in that case go to your injected Web3 Provider (Metamask for instance) and update/switch your Ethereum Node endpoint.

### I've imported a Multisig address or a contract address into address book but it gets detected as a EOA
Make sure you're connected to the same network your Multisig/contract was created on, if you created it on Mainnet, you should then connect to Mainnet in order to let the system detect its type correctly.


