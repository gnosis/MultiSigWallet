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
let lastPath = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

/**
*
*/
function restServerSetup () {
  let restServer = express();
  let restPort = 8080;
  let connection = null;
  restServer.use(bodyParser.json());
  /**
  *
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

  // Declare routes
  // @todo to be implemented
  restServer.route('/accounts/:path?')
  .get(function (req, res) {
    if (ledgerAddresses  && (!req.params.path || req.params.path == lastPath)) {
      res.json(ledgerAddresses);
    }
    else {
      getLedgerConnection()
      .then(
        function(eth) {
          Promise.race([
            eth.getAddress_async(decodeURIComponent(req.params.path) || "44'/60'/0'/0", true),
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
            lastPath = req.params.path || false;
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
          eth.signTransaction_async(lastPath || "44'/60'/0'/0", hex)
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
      if (restPort < 65536-1) {
        restPort++;
        _startRestServer();
      }
    });
  }

  // run rest server
  _startRestServer();
}

/**
*
*/
const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  // {
  //   label: 'Development',
  //   submenu: [
  //     {
  //       label: "Show DevTools",
  //       click () {
  //         if(mainWindow.webContents.isDevToolsOpened()) {
  //            mainWindow.webContents.closeDevTools()

  //         } 
  //         else {

  //           mainWindow.webContents.openDevTools();
  //         } 
  //       }
  //     }
  //   ]
  // },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
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
  //mainWindow.webContents.openDevTools();

  // Declare context menus
  const selectionMenu = Menu.buildFromTemplate([
    {role: 'copy'},
    {type: 'separator'},
    {role: 'selectall'},
  ]);

  const inputMenu = Menu.buildFromTemplate([
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {type: 'separator'},
    {role: 'selectall'},
  ]);

  
  // Set up context menu
  mainWindow.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup(mainWindow);
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(mainWindow);
    }
  });

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

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
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
