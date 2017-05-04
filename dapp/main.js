const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const express = require('express');
const ledger = require('ledgerco');
const EthereumTx = require('ethereumjs-tx');
let restServer, restPort = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function restServerSetup () {

  let restServer = express();
  let restPort = 8080;

  // Declare routes
  // @todo to be implemented
  restServer.route('/accounts')
  .get(function (req, res) {
    ledger
    .comm_node
    .create_async()
    .then(
      function(comm) {
        eth = new ledger.eth(comm);
        eth
        .getAddress_async("44'/60'/0'/0'/0", true)
        .then(function(address) {
          res.json([address.address]);
        });
      });
  });

  restServer.route('/sign-transaction')
  .get(function (req, res) {
    if (req.body && req.body.tx && req.body.chain) {
      ledger
      .comm_node
      .create_async()
      .then(
        function(comm) {
          // Encode using ethereumjs-tx
          let tx = new EthereumTx(req.body.tx);

          if (error) callback(error);

          // Set the EIP155 bits
          tx.raw[6] = Buffer.from([req.body.chain]); // v
          tx.raw[7] = Buffer.from([]);         // r
          tx.raw[8] = Buffer.from([]);         // s

          // Encode as hex-rlp for Ledger
          const hex = tx.serialize().toString("hex");

          eth = new ledger.eth(comm);

          // Pass to _ledger for signing
          eth.signTransaction_async("44'/60'/0'/0'/0", hex)
          .then(result => {
              // Store signature in transaction
              tx.v = new Buffer(result.v, "hex");
              tx.r = new Buffer(result.r, "hex");
              tx.s = new Buffer(result.s, "hex");

              // EIP155: v should be chain_id * 2 + {35, 36}
              const signedChainId = Math.floor((tx.v[0] - 35) / 2);
              if (signedChainId !== req.body.chain) {
                  cleanupCallback("Invalid signature received. Please update your Ledger Nano S.");
              }

              // Return the signed raw transaction
              const rawTx = "0x" + tx.serialize().toString("hex");
              res.json({signed: rawTx});
          })
          .catch(error => res.status(400));
      });
    }
    else {
      res.status(400).send();
    }
  });

  restServer.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
  });

  function _startRestServer () {
    restServer.listen(restPort, function () {
      console.log("Express Rest Server connected to port " + restPort);
    })
    .on('error', function (err) {
      if (restPort < 65536-1) {
        restPort++;
        _startRestServer();
      }
    });
  }

  // run rest server
  _startRestServer();
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      maximizable: true
    }
  );

  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  restServerSetup();

  /*mainWindow.webContents.executeJavaScript(`
    var path = require('path');
    module.paths.push(path.resolve('node_modules'));
    module.paths.push(path.resolve('../node_modules'));
    module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
    module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
    module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
    module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
    path = undefined;
  `);*/
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
