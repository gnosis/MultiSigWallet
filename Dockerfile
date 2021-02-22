FROM node:8
MAINTAINER ToMo Team

RUN apt-get update && apt-get install -y libusb-1.0-0-dev
RUN npm install -g pm2 truffle bower

WORKDIR /build

COPY ./package.json /build
RUN npm install --production
COPY  ./dapp /build/dapp
RUN cd ./dapp && npm install --production
RUN cd ./dapp && bower install --allow-root
COPY ./ /build

EXPOSE 80

CMD ["npm", "start"]
