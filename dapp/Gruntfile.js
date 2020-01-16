const DAPP_PORT = process.env.DAPP_PORT || 8282;
const DAPP_HOST = process.env.DAPP_HOST || "0.0.0.0";
const DAPP_CERT = process.env.DAPP_CERT || "localhost.crt";
const DAPP_KEY = process.env.DAPP_KEY || "localhost.key";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'http-server': {

        'dev': {

            // the server root directory
            root: './src',

            // the server port
            // can also be written as a function, e.g.
            // port: function() { return 8282; }
            port: DAPP_PORT,

            // the host ip address
            // If specified to, for example, "127.0.0.1" the server will
            // only be available on that ip.
            // Specify "0.0.0.0" to be available everywhere
            host: DAPP_HOST,

            // cache: <sec>,
            showDir : true,
            autoIndex: true,

            // server default file extension
            ext: "html"

        },
        ssl: {

            // the server root directory
            root: './',

            // the server port
            // can also be written as a function, e.g.
            // port: function() { return 8282; }
            port: DAPP_PORT,

            // the host ip address
            // If specified to, for example, "127.0.0.1" the server will
            // only be available on that ip.
            // Specify "0.0.0.0" to be available everywhere
            host: DAPP_HOST,

            // cache: <sec>,
            showDir : true,
            autoIndex: true,

            // server default file extension
            ext: "html",

            // run in parallel with other tasks
            // runInBackground: true|false,

            // specify a logger function. By default the requests are
            // sent to stdout.
            // logFn: function(req, res, error) { },

            // Proxies all requests which can't be resolved locally to the given url
            // Note this this will disable 'showDir'
            // proxy: "http://someurl.com",

            /// Use 'https: true' for default module SSL configuration
            /// (default state is disabled)
            https: {
                cert: DAPP_CERT,
                key:  DAPP_KEY
            },
            //
            // // Tell grunt task to open the browser
            // openBrowser : false,
            //
            // // customize url to serve specific pages
            // customPages: {
            //     "/readme": "README.md",
            //     "/readme.html": "README.html"
            // }
          }
    },
    ngtemplates:  {
      multiSigWeb:        {
        src:      ['src/partials/**.html', 'src/partials/modals/**.html'],
        dest:     'src/partials.js'
      }
    },
    watch: {
      scripts: {
        files: ['src/partials/*.html', 'src/partials/modals/*.html'],
        tasks: ['ngtemplates'],
        options: {
          livereload: true,
        }
      }
    },
    eslint: {
     target: ['Gruntfile.js', 'src/controllers/**.js', 'src/services/**.js', '**.js']
   },
   'npm-command': {
      certs: {
        options: {
          args: ["certs"],
          cmd: "run"
        }
      }
    }
  });

  grunt.registerTask('ssl-cert', function () {
    if (!grunt.file.exists('./localhost.crt') && !grunt.file.exists('./localhost.key')) {      
      grunt.task.run(['npm-command']);
    }
  });

  // Load the plugin that provides the http server.
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-npm-command');

  grunt.registerTask('default', ['ngtemplates', 'http-server']);
  grunt.registerTask('ledger', ['ssl-cert', 'ngtemplates', 'http-server:ssl']);
  grunt.registerTask('bundle', '', function () {
    // Command: `npx grunt bundle` or `npx grunt bundle --mode=electron`
    const fs = require('fs');
    const path = require('path')
    const Terser = require("terser");

    const MODE_WEB = 'web';
    const appMode = grunt.option('mode') || 'web';
    const minify = grunt.option('minify') ? grunt.option('minify') : false;
    console.log(`Running in ${appMode} mode`);

    const jsBundlePath = path.resolve(__dirname, 'src/bundles/js/bundle.js');
    const jsStandaloneDirPath = path.resolve(__dirname, 'src/bundles/js');
    const cssBundlePath = path.resolve(__dirname, 'src/bundles/css/bundle.css');
    const fontsStandaloneDirPath = path.resolve(__dirname, 'src/bundles/fonts');

    const modules = [
      'node_modules/web3/dist/web3.min.js',
      'node_modules/web3-provider-engine/dist/HookedWalletSubprovider.js',
      'node_modules/web3-provider-engine/dist/RpcSubprovider.js',
      'node_modules/web3-provider-engine/dist/ProviderEngine.js',
      'node_modules/browser-builds/dist/ethereumjs-tx/ethereumjs-tx-1.3.3.min.js',
      'node_modules/angular/angular.min.js',
      'node_modules/angular-animate/angular-animate.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/angular-touch/angular-touch.min.js',
      'node_modules/bootstrap3-dialog/dist/js/bootstrap-dialog.min.js',
      'node_modules/moment/min/moment-with-locales.min.js',
      'node_modules/abi-decoder/dist/abi-decoder.js',
      'node_modules/clipboard/dist/clipboard.min.js',
      'node_modules/ngclipboard/dist/ngclipboard.min.js',
      'node_modules/angular-ui-notification/dist/angular-ui-notification.min.js',
      'src/trezor-connect-v4.js'
    ];

    const webOnlyModules = [
      'node_modules/ledger-wallet-provider/dist/ledgerwallet.js'
    ];

    const standaloneLibs = [
      {
        'name': 'jquery.min.js',
        'path': 'node_modules/jquery/dist/jquery.min.js'
      }
    ];

    const css = [
      'css/app.css',
      'css/gnosis-bootstrap.css',
      'css/gnosis-bootstrap-dialog.css',
      'node_modules/font-awesome/css/font-awesome.min.css',
      'node_modules/spinkit/css/spinkit.css',
      'node_modules/angular-ui-notification/dist/angular-ui-notification.css'
    ];

    const standaloneFonts = [
      {
        'name': 'fontawesome-webfont.woff2',
        'path': 'node_modules/font-awesome/fonts/fontawesome-webfont.woff2',
      }
    ];

    try {
      // Remove file if it exists
      fs.unlinkSync(jsBundlePath);
    } catch (error) {
      //console.error(error);
    }
    try {
      fs.unlinkSync(cssBundlePath);
    } catch (error) {
      //console.error(error);
    }

    let jsBundleFileContent = '';
    let moduleContent;
    for (let x in modules) {
      console.log("Packaging " + modules[x]);
      moduleContent = fs.readFileSync(modules[x], 'utf8');
      jsBundleFileContent += '\n';
      jsBundleFileContent += moduleContent;
    }

    if (appMode == MODE_WEB) {
      moduleContent = '';
      for (let x in webOnlyModules) {
        console.log("Packaging " + webOnlyModules[x]);
        moduleContent = fs.readFileSync(webOnlyModules[x], 'utf8');
        jsBundleFileContent += '\n';
        jsBundleFileContent += moduleContent;
      }
    }

    // Update file
    if (minify) {
      console.log('Start minifying JS...');
      jsBundleFileContent = Terser.minify(jsBundleFileContent); // Minify JS
      if (jsBundleFileContent.error) {
        console.error('There have been some errores while minifying', jsBundleFileContent.error);
      } else {
        console.log('Saving bundled file...');
        fs.writeFileSync(jsBundlePath, jsBundleFileContent.code, 'utf8');
      }
    } else {
      fs.writeFileSync(jsBundlePath, jsBundleFileContent, 'utf8');
    }

    // Standalone libs
    let standaloneModuleContent;
    let jsStandaloneFileContent;
    for (let x in standaloneLibs) {
      console.log("Packaging " + standaloneLibs[x].name);
      standaloneModuleContent = fs.readFileSync(standaloneLibs[x].path, 'utf8');
      jsStandaloneFileContent = ''; // clear file content
      jsStandaloneFileContent += '\n';
      jsStandaloneFileContent += standaloneModuleContent;
      fs.writeFileSync(jsStandaloneDirPath + '/' + standaloneLibs[x].name, jsStandaloneFileContent, 'utf8');
    }
    
    // Package CSS
    let cssBundleFileContent = '';
    let cssContent;
    for (let x in css) {
      console.log("Packaging " + css[x]);
      cssContent = fs.readFileSync(css[x], 'utf8');
      cssBundleFileContent += '\n';
      cssBundleFileContent += cssContent;
    }
    // Update file
    fs.writeFileSync(cssBundlePath, cssBundleFileContent, 'utf8');

    // Copy standalone Fonts
    for (let x in standaloneFonts) {
      console.log("Copying " + standaloneFonts[x].path + "into fonts/" + standaloneFonts[x].name);
      // fs.copyFileSync(src, dest)
      fs.copyFileSync(standaloneFonts[x].path, fontsStandaloneDirPath + '/' + standaloneFonts[x].name)
    }

  })
};
