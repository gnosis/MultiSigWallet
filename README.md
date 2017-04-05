Ethereum Multisignature Wallet
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

Reviewers
-------------
The following people have reviewed the code at the time of the linked commit:
- Stefan George ([Georgi87](https://github.com/Georgi87)): [b9405cc30de4615e325b1d46c71cdef670bdeadc](https://github.com/ConsenSys/MultiSigWallet/tree/b9405cc30de4615e325b1d46c71cdef670bdeadc)

Being used by
-------------
- [Golem](https://golem.network/)
- Brace
- [Weifund](http://weifund.io/)
- StabL

Install
-------------
```
git clone https://github.com/ConsenSys/MultiSigWallet.git
cd MultiSigWallet
vagrant up
```

Test
-------------
### Run single test:
```
cd /vagrant/contracts/
python -m unittest tests.test_multisig_wallet
```
### Run all tests:
```
cd /vagrant/contracts/
python -m unittest discover tests
```

Deploy
-------------
**Remember to change owner addresses in the respective JSON file before deployment!**
### Deploy multisig wallet:
```
cd /vagrant/contracts/
python deploy.py -f deploy/MultiSig.json
```
### Deploy multisig wallet with daily limit:
```
cd /vagrant/contracts/
python deploy.py -f deploy/MultiSigWithDailyLimit.json
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
- Golem [0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9] (https://etherscan.io/address/0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9)

License
-------------
[GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt)
