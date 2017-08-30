# Developer Guide

All information regarding contributing to and progressing `ethjs-abi` module can be found in this document.

## Install

```
npm install --save ethjs-abi
```

## Install from Source

```
git clone http://github.com/ethjs/ethjs-abi
npm install
```

## Test

```
npm test
```

## Build

```
npm run build
```

## Linting

```
npm run lint
```

## Travis-ci and Coveralls Testing

Note, this will generate a `coveralls` report locally.

```
npm run test-travis
```

You can find the coveralls report and view the percentages and stats, by going to the [index.html](coverage/lcov-report/index.html) file generated after running the `test-travis` script. Open this in Chrome to see the generated report. Travis will run mocha as usual, but collect information about the testing coverage. This report will be sent by TravisCI during the automated build process.

## Build Staging

The build staging for this module is as follows:

 1. Cleanup
 2. Linting
 3. Testing
 4. Babel processing (output to lib)
 5. Webpack (output to dist)
 6. Webpack production (output to dist)
 7. Retest lib folder for babel processing solidity
 8. Report build stats

## Folder Structure

All module source code is found in the `src` directory. All module helper scripts can be found in the `scripts` folder. These will not need to be touched, and are purely configuration for this repository.

```
./ethjs-abi
  ./.github
  ./dist
  ./lib
    ./tests
  ./internals
    ./webpack
  ./coverage
  ./docs
  ./src
    ./tests
```

Note, the `./lib` dir is generated from the babel build staging. `./coverage` is generated from the `npm run test-travis` script. All internals and helper scripts (i.e. `webpack`) are in `./internals`. All distribution builds are in `./dist` (usually a minified and unminified production build of the package).

## NPM Practice

Across all `ethjs-` repos, we enforce version hardening (i.e. "0.0.3" not "^0.0.3"). We want to reduce potential hazardous install changes from dependancies as much as possible to ensure package preformace, testing, security and design. Please make sure all your commits and PR's are version hardend if you are installing or removing new packages.

After build staging it is the `lib` folder which actually gets published to NPM. This allows for easy inclusion into other modules which may not use babel transpiling or which may not support es2015+.

## NPM/Node Version Requirements

`ethjs` requires you have:
  - `nodejs` -v 6.5.0+
  - `npm` -v 3.0+

This is a requirement to run, test, lint and build this module.

## Webpack

`ethjs` uses webpack across all its browser focused repos. Webpack is used to package down project files into distribution builds for the browser. You can see the builds it produces by going to the [dist](dist) folder.

Read more about webpack here:
https://github.com/webpack/docs

## Latest Webpack Figures

Hash: 4fa0358f53cd22b7449f                                                           
Version: webpack 2.1.0-beta.15
Time: 1047ms
           Asset    Size  Chunks             Chunk Names
    ethjs-abi.js  263 kB       0  [emitted]  main
ethjs-abi.js.map  322 kB       0  [emitted]  main
    + 13 hidden modules

> ethjs-abi@0.1.2 build:umd:min /home/nick/github/ethjs-abi
> cross-env BABEL_ENV=commonjs NODE_ENV=production webpack --config ./internals/webpack/webpack.config.js ./lib/index.js --progress

Hash: d64adbab3f85ed9aab80                                                           
Version: webpack 2.1.0-beta.15
Time: 4184ms
           Asset    Size  Chunks             Chunk Names
ethjs-abi.min.js  118 kB       0  [emitted]  main
    + 13 hidden modules

## Changelog

All relevant changes are notated in the `CHANGELOG.md` file, moniter this file for changes to this repository.

## Travis-ci and Coveralls Practice

Across all `ethjs-` repos, we enforce mandatory travis-ci and coveralls testing. We never `commit to master`. As a general policy, Coveralls.io results must always be above 95% for any `ethjs-` PR or commit. We want to ensure complete coverage across the board.

## Contributing

Please help better the ecosystem by submitting issues and pull requests. We need all the help we can get to build the absolute best linting standards and utilities. We follow the AirBNB linting standard. Please read more about contributing to `ethjs-abi` in the `.github/CONTRIBUTING.md`.

## Licence

This project is licensed under the MIT license, Copyright (c) 2016 Nick Dodson. For more information see LICENSE.
