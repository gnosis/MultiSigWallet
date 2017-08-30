# LedgerWalletProvider

The LedgerWalletProvider lets your dapp communicate directly with a user's [Ledger Nano S](https://www.ledgerwallet.com/products/ledger-nano-s) using the [zero client provider engine](https://github.com/MetaMask/provider-engine) developed by Metamask.

Instead of setting your web3's provider to an HttpProvider or IpcProvider, you can create a custom provider using the [provider engine](https://github.com/MetaMask/provider-engine) and tell it to use LedgerWalletProvider for all id management requests (e.g getAccounts, approveTransaction and signTransaction). This way, your users can confirm your dapp's transactions directly from their Ledger Nano S!

# Requirements

In order for your dapp to play nicely with the LedgerWallet over U2F, it will need to be served over https. In addition to this, your browser must support U2F. Firefox users can use this [U2F extension](https://addons.mozilla.org/en-US/firefox/addon/u2f-support-add-on/). If on chrome or opera, LedgerWalletProvider will automatically polyfill U2F support for you.

# Installation

```
npm install ledger-wallet-provider --save
```

# Usage

In order to have a working provider you can pass to your web3, you will need these additional dependencies installed:

```
npm install web3-provider-engine --save
```
```
npm install web3 --save
```

In your project, add the following:

```
var Web3 = require('web3');
var ProviderEngine = require('web3-provider-engine');
var RpcSubprovider = require('web3-provider-engine/subproviders/rpc');
var LedgerWalletSubproviderFactory = require('ledger-wallet-provider').default;

var engine = new ProviderEngine();
var web3 = new Web3(engine);

var ledgerWalletSubProvider = LedgerWalletSubproviderFactory();
engine.addProvider(ledgerWalletSubProvider);
engine.start();

web3.eth.getAccounts(console.log);
```

**Note:** In order to send requests to the Ledger wallet, the user must have done the following:
- Plugged-in their Ledger Wallet Nano S
- Input their 4 digit pin
- Navigated to the Ethereum app on their device
- Enabled 'browser' support from the Ethereum app settings

It is your responsibility to show the user a friendly message, instructing them to do so. In order to detect when they have completed these steps, you can poll `web3.eth.getAccounts` which will return `undefined` until the Ledger Wallet is accessible.

If you would like to detect whether or not a user's browser supports U2F, you can call the `isSupported` convenience method on the `ledgerWalletSubProvider`:

```
var LedgerWalletSubproviderFactory = require('ledger-wallet-provider').default;

var ledgerWalletSubProvider = LedgerWalletSubproviderFactory();
ledgerWalletSubProvider.isSupported()
    .then(function(isSupported) {
        console.log(isSupported ? 'Yes' : 'No');
    });
```

This might be helpful if you want to conditionally show Ledger Nano S support to users who could actually take advantage of it.
