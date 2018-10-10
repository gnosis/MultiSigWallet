#!/bin/bash

ENABLED_BRANCH="develop"

echo "=== PREPARE DEPLOY ==="

# Check dist is for desktop devices and the commit was towards
if [[ ${DIST} == "desktop" ]] && [[ ${TRAVIS_BRANCH} == ${ENABLED_BRANCH} || ${TRAVIS_BRANCH} == ${TRAVIS_TAG} ]] && [[ ${TRAVIS_OS_NAME} == "linux" ]]; then
  cd dapp/ && mkdir dist && npm run build-linux;

  if [[ ${TRAVIS_BRANCH} == ${TRAVIS_TAG} ]]; then
    # it is a TAG
    mv multisigweb*.deb multisigweb-$TRAVIS_TAG.deb;
  fi
fi

if [[ ${DIST} == "desktop" ]] && [[ ${TRAVIS_BRANCH} == ${ENABLED_BRANCH} || ${TRAVIS_BRANCH} == ${TRAVIS_TAG} ]] && [[ ${TRAVIS_OS_NAME} == "osx" ]]; then
  cd dapp/ && mkdir dist && npm run build-osx;

  if [[ ${TRAVIS_BRANCH} == ${TRAVIS_TAG} ]]; then
    # it is a TAG
    mv multisigweb*-mac.zip multisigweb-$TRAVIS_TAG-mac.zip;
    mv multisigweb*.dmg multisigweb-$TRAVIS_TAG.dmg;
  fi
fi

if [[ ${DIST} == "web" ]] && [[ ${TRAVIS_OS_NAME} == "linux" ]]; then
  rm -rf dapp/node_modules/electron* dapp/node_modules/http-server dapp/node_modules/grunt* dapp/node_modules/webpack dapp/node_modules/karma* dapp/node_modules/babel*;
fi

echo "=== PREPARE DEPLOY DONE ==="
