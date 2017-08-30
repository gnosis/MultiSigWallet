#!/bin/bash

TARGETS="vm tx icap wallet wallet-hd wallet-thirdparty all"

for TARGET in $TARGETS; do
  echo Building $TARGET
  browserify --s EthJS src/$TARGET.js > ./dist/ethereumjs-$TARGET.js
done
