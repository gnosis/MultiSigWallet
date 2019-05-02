// Karma configuration
// Generated on Wed Jan 11 2017 14:38:33 GMT+0100 (CET)

module.exports = function(config) {
  const karmaConfig = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'tests/globalvars.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'node_modules/angular-route/angular-route.min.js',
      'node_modules/ngclipboard/dist/ngclipboard.min.js',
      'node_modules/web3/dist/web3.min.js',
      'node_modules/abi-decoder/dist/abi-decoder.js',
      'node_modules/web3-provider-engine/dist/ProviderEngine.js',
      'node_modules/angular-ui-notification/dist/angular-ui-notification.min.js',
      // 'node_modules/phantomjs-polyfill-object-assign/object-assign-polyfill.js',
      'src/app.js',
      'src/abi.js',
      'src/config.js',
      'src/services/**/*.js',
      'tests/*.test*'
    ],


    // list of files to exclude
    exclude: [
      //'services/Utils.js',
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {

    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'], //['PhantomJS'], //['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity, 

  };

  // 
  // config.set(
  var configuration = {
    // other things
    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },
  };
 
  if (process.env.TRAVIS) {
      configuration.browsers = ['Chrome_travis_ci'];
  }
 
  config.set(Object.assign({}, karmaConfig, configuration));
};
