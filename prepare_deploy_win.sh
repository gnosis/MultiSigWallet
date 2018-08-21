#!/bin/bash

echo "=== PREPARE DEPLOY ==="

echo "=== Appveyor === %APPVEYOR%" 

if [[ ${APPVEYOR_REPO_TAG} == true ]]; then
  # it is a TAG
  # rename .exe file
  mv multisigweb*.exe multisigweb-$APPVEYOR_REPO_TAG.exe
fi

echo "=== PREPARE DEPLOY DONE ==="
