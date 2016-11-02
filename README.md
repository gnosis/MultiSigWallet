Multisignature Wallet
===================

Allows multiple parties to agree on transactions before execution. Allows to add and remove owners and update the number of required confirmations.

Install
-------------
```
git clone https://github.com/ConsenSys/MultiSigWallet.git
cd MultiSigWallet
vagrant up
```

Test
-------------
### Run test:
```
cd /vagrant/
python -m unittest tests.test_multisig_wallet
```

Security
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

Reviewers
-------------
The following people have reviewed the code (commit they reviewed in parentheses):
- Stefan George ([Georgi87](https://github.com/Georgi87)): [62247de24b979ab0d055768589784cb275a07afe](https://github.com/ConsenSys/MultiSigWallet/tree/62247de24b979ab0d055768589784cb275a07afe)

License
-------------
[GPL v3](https://github.com/ConsenSys/MultiSigWallet/blob/master/LICENSE.txt)
