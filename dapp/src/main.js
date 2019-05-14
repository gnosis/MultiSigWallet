const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const path = require('path');
const url = require('url');
const express = require('express');
const ledger = require('ledgerco');
const EthereumTx = require('ethereumjs-tx');
const bodyParser = require('body-parser');
let restServer, restPort = null;
let ledgerAddresses = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

process.on('unhandledRejection', function (error) {
  console.log(error);
});

/**
* Configures and starts an internal REST server
*/
function restServerSetup () {
  restServer = express();
  restPort = 8080;
  let connection = null;
  // Ledger legacy derivation path
  const derivationPath = "44'/60'/0'/0";
  restServer.use(bodyParser.json());
  /**
  * Gets connection to Ledger HW
  */
  function getLedgerConnection() {
    const connectionPromise = new Promise( (resolve, reject) => {
      if (!connection) {
        ledger.comm_node.create_async().then(function (comm) {
          connection = new ledger.eth(comm);
          resolve(connection);
        });
      }
      else {
        const checkPromise = new Promise( function (resolve, reject) {
          connection
          .getAppConfiguration_async()
          .then(function (version) {
            resolve(connection);
          });
        });

        Promise.race([
          checkPromise,
          new Promise(
            (_, reject) => {
              setTimeout(
              () => {
                ledger.comm_node.create_async().then(function (comm) {
                  connection = new ledger.eth(comm);
                  resolve(connection);
                });
              },
              3000);
            })
        ]).then(function () {
          resolve(connection);
        });

      }
    });

    return Promise.race([
      connectionPromise,
      new Promise(
        (_, reject) => {
          setTimeout(
          () => {
            connectionOpened = false;
            reject({error: 'timeout'});
          },
          10000);
        })
    ]);
  }

  // Declare REST routes
  restServer.route('/accounts')
  .get(function (req, res) {
    if (ledgerAddresses) {
      res.json(ledgerAddresses);
    }
    else {
      getLedgerConnection()
      .then(
        function(eth) {
          Promise.race([
            eth.getAddress_async(derivationPath, true),
            new Promise(
              (_, reject) => {
                setTimeout(
                () => {
                  reject({error: 'timeout'});
                },
                5000);
              })
          ])
          .then(function(addresses) {
            ledgerAddresses = [addresses.address];
            res.json([addresses.address]);
          }, function (){
            res.status(500).send();
          });
        }, function (e) {
          res.status(500).json(e);
        });
    }
  });

  restServer.route('/sign-transaction')
  .post(function (req, res) {
    if (req.body && req.body.tx && req.body.chain) {
      getLedgerConnection()
      .then(
        function(eth) {
          // Encode using ethereumjs-tx
          req.body.tx.gasLimit = req.body.tx.gas;
          let tx = new EthereumTx(req.body.tx);

          // Set the EIP155 bits
          tx.raw[6] = Buffer.from([parseInt(req.body.chain)]); // v
          tx.raw[7] = Buffer.from([]);         // r
          tx.raw[8] = Buffer.from([]);         // s

          // Encode as hex-rlp for Ledger
          const hex = tx.serialize().toString("hex");

          // Pass to _ledger for signing
          eth.signTransaction_async(derivationPath, hex)
          .then(result => {
              // Store signature in transaction
              tx.v = new Buffer(result.v, "hex");
              tx.r = new Buffer(result.r, "hex");
              tx.s = new Buffer(result.s, "hex");

              // EIP155: v should be chain_id * 2 + {35, 36}
              const signedChainId = Math.floor((tx.v[0] - 35) / 2);

              if (signedChainId !== parseInt(req.body.chain)) {
                  res.status(400).json({error: "Invalid signature received. Please update your Ledger Nano S."});
              }

              // Return the signed raw transaction
              const rawTx = "0x" + tx.serialize().toString("hex");
              res.json({signed: rawTx});
          })
          .catch(error => res.status(400).send(error));
      });
    }
    else {
      res.status(400).json({error: "Missing params"});
    }
  });

  restServer.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'});
  });

  function _startRestServer () {
    restServer.listen(restPort, function () {
      console.log("Express Rest Server connected to port " + restPort);
      global['ledgerPort'] = restPort;
    })
    .on('error', function (err) {
      // Look for ports available internally on user's PC
      if (restPort < 65536-1) {
        restPort++;
        _startRestServer();
      }
    });
  }

  // run rest server
  _startRestServer();
}

/****************************************************************
 * 
 *       ELECTRON APPLICATION SETUP/CONFIGURATION
 * 
 ****************************************************************/

/**
* Creates the main menu (upper application menu)
*/
function createMainMenu () {
  const application = {
    label: 'Application',
    submenu: [
      {
        label: 'About',
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ],
  };

  const template = [application, edit];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/**
 * Creates the context menus (right mouse click menus)
 * @param {window} windowInstance 
 */
function createContextMenus (windowInstance) {
  // Declare context menus
  const selectionMenu = Menu.buildFromTemplate([
    {role: 'copy'},
    {type: 'separator'},
    {role: 'selectall'}
  ]);

  const inputMenu = Menu.buildFromTemplate([
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {type: 'separator'},
    {role: 'selectall'}
  ]);

  // Set up context menu
  windowInstance.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup(windowInstance);
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(windowInstance);
    }
  });
}

/**
 * Creates the main window
 */
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      maximizable: true
    }
  );

  mainWindow.maximize();

  // and load the app's index.html file.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools only if on "development" environment.
  if (process.env.NODE_ENV == 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  createContextMenus(mainWindow);
  createMainMenu();
  restServerSetup();
}

// https://github.com/electron/electron/blob/master/docs/api/app.md#appsetnamename
app.setName('Gnosis Multisig');

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
