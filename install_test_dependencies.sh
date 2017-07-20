# apt-get install -y curl python-dev \
#     libreadline-dev libbz2-dev libssl-dev libsqlite3-dev libxslt1-dev \
#     libxml2-dev libxslt1-dev git python-pip build-essential automake libtool libffi-dev libgmp-dev pkg-config
#
# if ! which eth | grep -q /usr/bin/eth || ! which solc | grep -q /usr/bin/solc; then
#     sudo apt-get install -y software-properties-common
#     sudo add-apt-repository -y ppa:ethereum/ethereum
#     sudo add-apt-repository -y ppa:ethereum/ethereum-dev
#     sudo apt-get update
# fi
#
# sudo apt-get install libboost-filesystem1.54.0 libboost-program-options1.54.0 libboost-system1.54.0 solc
# locale-gen en_US en_US.UTF-8 pt_BR.UTF-8 de_DE.UTF-8
# dpkg-reconfigure locales
#
# if [ ! -d ~/.pyenv ]; then
#     pip install --egg pyenv
# else
#     . ~/.bash_profile
#     pyenv update
# fi
#
# if [ ! -f ~/.bash_profile ]; then
#     touch ~/.bash_profile
# fi
#
# if ! grep -q pyenv ~/.bash_profile; then
#     echo '
#       export PATH="$HOME/.pyenv/bin:$PATH"
#       eval "$(pyenv init -)"
#       eval "$(pyenv virtualenv-init -)"
#       export PYENV_VIRTUALENVWRAPPER_PREFER_PYVENV="true"
#     ' >> ~/.bash_profile
# fi
#
# . ~/.bash_profile
# pyenv install 2.7.9
# pyenv rehash
# pyenv global 2.7.9
#
# pip install --upgrade pip
# pip install -r /vagrant/requirements.txt

apt-get install -y curl hidapi
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install -y nodejs
npm install -g git+https://github.com/ethereumjs/testrpc
npm install -g mocha
npm install -g solc

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

npm install -g node-gyp
npm install -g node-hid
npm install -g rx

npm install
