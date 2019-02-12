
npm install -g yarn

cd dist/win-unpacked
git clone https://github.com/trezor/connect.git
cd connect
yarn

# cd dist/win-unpacked/connect
# yarn run dev

# window.__TREZOR_CONNECT_SRC = 'https://localhost:8088/'
# web3.toChecksumAddress