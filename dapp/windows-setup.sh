
npm install -g yarn
npm install -g grunt-cli

rm -rf node_modules && rm package-lock.json
yarn add secp256k1
yarn install
mkdir dist

# to compile in new shell
export DEBUG="electron-builder"
yarn run build-win
