VALOR Multisignature Wallet
===================



The purpose of multisig wallets is to increase security by requiring multiple parties to agree on transactions before execution. Transactions can be executed only when confirmed by a predefined number of owners. A web user interface can be found [here](/dapp).

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
git clone https://github.com/gnosis/MultiSigWallet.git
cd MultiSigWallet
npm install
```

If you get an error like
```
node-pre-gyp ERR! Tried to download(404): https://github.com/node-hid/node-hid/releases/download/0.5.4/HID-v0.5.4-node-v57-linux-x64.tar.gz
```
Please check issue https://github.com/gnosis/MultiSigWallet/issues/178


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

Deploy
-------------
### Deploy multisig wallet:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations>
```
### Deploy multisig wallet with daily limit:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations> <dailyLimit>
```



Limitations
-------------
This implementation does not allow the creation of smart contracts via multisignature transactions.
Transactions to address 0 cannot be done. Any other transaction can be done.

Security
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

Deployed instances with significant funds
-------------
- Aragon [0xcafe1a77e84698c83ca8931f54a755176ef75f2c](https://etherscan.io/address/0xcafe1a77e84698c83ca8931f54a755176ef75f2c)
- Bancor [0x5894110995b8c8401bd38262ba0c8ee41d4e4658](https://etherscan.io/address/0x5894110995b8c8401bd38262ba0c8ee41d4e4658)
- Golem [0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9](https://etherscan.io/address/0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9)
- MysteriumDev [0x7e6614722614e434c4df9901bab31e466ba12fa4](https://etherscan.io/address/0x7e6614722614e434c4df9901bab31e466ba12fa4)
- District0x [0xd20e4d854c71de2428e1268167753e4c7070ae68](https://etherscan.io/address/0xd20e4d854c71de2428e1268167753e4c7070ae68)

License
-------------
[LGPL v3](./LICENSE)
