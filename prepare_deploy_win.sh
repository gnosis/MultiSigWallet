#!/bin/bash

echo "=== PREPARE DEPLOY ==="

if [[ ${APPVEYOR_REPO_TAG} == true ]]; then
  # it is a TAG
  # rename .exe file
  echo "Renaming multisigweb.*.exe to multisigweb-$APPVEYOR_REPO_TAG.exe"
  mv dapp/dist/multisigweb*.exe dapp/dist/multisigweb-$APPVEYOR_REPO_TAG.exe
fi

echo "=== PREPARE DEPLOY DONE ==="
