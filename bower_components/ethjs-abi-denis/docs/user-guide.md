# User Guide

All information for developers using `ethjs-abi` should consult this document.

## Install

```
npm install --save ethjs-abi
```

## Usage

```js
const abi = require('ethjs-abi');
const SimpleStoreABI = [{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"set","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"get","outputs":[{"name":"storeValue","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_newValue","type":"uint256"},{"indexed":false,"name":"_sender","type":"address"}],"name":"SetComplete","type":"event"}];


const setInputBytecode = abi.encodeMethod(SimpleStoreABI[0], [24000]);

// returns 0x60fe47b10000000000000000000000000000000000000000000000000000000000005dc0

const setOutputBytecode = abi.decodeMethod(SimpleStoreABI[0], "0x0000000000000000000000000000000000000000000000000000000000000001");

// returns  Result { '0': true }



const getInputBytecode = abi.encodeMethod(SimpleStoreABI[1], []);

// returns 0x6d4ce63c

const getMethodOutputBytecode = abi.decodeMethod(SimpleStoreABI[1], "0x000000000000000000000000000000000000000000000000000000000000b26e");

// returns Result { '0': <BN: b26e>, storeValue: <BN: b26e> }



const SetCompleteInputBytecode = abi.encodeEvent(SimpleStoreABI[2], [24000, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"]);

// returns 0x10e8e9bc0000000000000000000000000000000000000000000000000000000000005dc0000000000000000000000000ca35b7d915458ef540ade6068dfe2f44e8fa733c

const SetCompleteOutputBytecode = abi.decodeEvent(SimpleStoreABI[2], "0x0000000000000000000000000000000000000000000000000000000000000d7d000000000000000000000000ca35b7d915458ef540ade6068dfe2f44e8fa733c");

/* returns   Result {
  '0': <BN: d7d>,
  '1': '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  _newValue: <BN: d7d>,
  _sender: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c' }
*/
```

## BN

This module returns `BN`s for all quantity values. However, the module supports both BN.js and BigNumber.js modules for encoding, but will only return `BN` instances while decoding.

## Safe Object Returns (decoding)

Instead of returning an array of params as decoded from the method, `ethjs-abi` will return a safe object that allows you to both get a value at it's return index or optionally, its name.

For example:

```js
{
  '0': <BN: d7d>,
  '1': '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
  _newValue: <BN: d7d>,
  _sender: '0xca35b7d915458ef540ade6068dfe2f44e8fa733c' }
```

## Why BN.js?

`ethjs` has made a policy of using `BN.js` across all of its repositories. Here are some of the reasons why:

  1. lighter than alternatives (BigNumber.js)
  2. faster than most alternatives, see [benchmarks](https://github.com/indutny/bn.js/issues/89)
  3. used by the Ethereum foundation across all [`ethereumjs`](https://github.com/ethereumjs) repositories
  4. is already used by a critical JS dependency of many ethereum packages, see package [`elliptic`](https://github.com/indutny/elliptic)
  5. purposefully **does not support decimals or floats numbers** (for greater precision), remember, the Ethereum blockchain cannot and will not support float values or decimal numbers.

## Browser Builds

`ethjs` provides production distributions for all of its modules that are ready for use in the browser right away. Simply include either `dist/ethjs-abi.js` or `dist/ethjs-abi.min.js` directly into an HTML file to start using this module. Note, an `ethAbi` object is made available globally.

```html
<script type="text/javascript" src="ethjs-abi.min.js"></script>
<script type="text/javascript">
new ethAbi(...);
</script>
```

Note, even though `ethjs` should have transformed and polyfilled most of the requirements to run this module across most modern browsers. You may want to look at an additional polyfill for extra support.

Use a polyfill service such as `Polyfill.io` to ensure complete cross-browser support:
https://polyfill.io/

## Latest Webpack Figures

```
Hash: 492bde711463f9215365                                                           
Version: webpack 2.1.0-beta.15
Time: 1066ms
           Asset    Size  Chunks             Chunk Names
    ethjs-abi.js  186 kB       0  [emitted]  main
ethjs-abi.js.map  228 kB       0  [emitted]  main
    + 14 hidden modules

Hash: a5dc8d1c909ad22a89ba                                                           
Version: webpack 2.1.0-beta.15
Time: 4291ms
           Asset     Size  Chunks             Chunk Names
ethjs-abi.min.js  83.1 kB       0  [emitted]  main
    + 14 hidden modules
```

## Other Awesome Modules, Tools and Frameworks

### Foundation
 - [web3.js](https://github.com/ethereum/web3.js) -- the original Ethereum JS swiss army knife **Ethereum Foundation**
 - [ethereumjs](https://github.com/ethereumjs) -- critical ethereum javascript infrastructure **Ethereum Foundation**
 - [browser-solidity](https://ethereum.github.io/browser-solidity) -- an in browser Solidity IDE **Ethereum Foundation**

### Nodes
  - [geth](https://github.com/ethereum/go-ethereum) Go-Ethereum
  - [parity](https://github.com/ethcore/parity) Rust-Ethereum build in Rust
  - [testrpc](https://github.com/ethereumjs/testrpc) Testing Node (ethereumjs-vm)

### Testing
 - [wafr](https://github.com/silentcicero/wafr) -- a super simple Solidity testing framework
 - [truffle](https://github.com/ConsenSys/truffle) -- a solidity/js dApp framework
 - [embark](https://github.com/iurimatias/embark-framework) -- a solidity/js dApp framework
 - [dapple](https://github.com/nexusdev/dapple) -- a solidity dApp framework
 - [chaitherium](https://github.com/SafeMarket/chaithereum) -- a JS web3 unit testing framework
 - [contest](https://github.com/DigixGlobal/contest) -- a JS testing framework for contracts

### Wallets
 - [ethers-wallet](https://github.com/ethers-io/ethers-wallet) -- an amazingly small Ethereum wallet
 - [metamask](https://metamask.io/) -- turns your browser into an Ethereum enabled browser =D

## Our Relationship with Ethereum & EthereumJS

 We would like to mention that we are not in any way affiliated with the Ethereum Foundation or `ethereumjs`. However, we love the work they do and work with them often to make Ethereum great! Our aim is to support the Ethereum ecosystem with a policy of diversity, modularity, simplicity, transparency, clarity, optimization and extensibility.

 Many of our modules use code from `web3.js` and the `ethereumjs-` repositories. We thank the authors where we can in the relevant repositories. We use their code carefully, and make sure all test coverage is ported over and where possible, expanded on.
