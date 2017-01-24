Multisignature Wallet
===================

Allows multiple parties to agree on transactions before execution. Allows to add and remove owners and update the number of required confirmations. A web user interface can be found [here](/dapp).

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

Reviewers
-------------
The following people have reviewed the code at the time of the linked commit:
- Stefan George ([Georgi87](https://github.com/Georgi87)): [b9405cc30de4615e325b1d46c71cdef670bdeadc](https://github.com/ConsenSys/MultiSigWallet/tree/b9405cc30de4615e325b1d46c71cdef670bdeadc)

Deployed instances with significant funds
-------------
- Golem [0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9] (https://etherscan.io/address/0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9)

License
-------------
[GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt)
