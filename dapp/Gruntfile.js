module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'http-server': {

        'dev': {

            // the server root directory
            root: './',

            // the server port
            // can also be written as a function, e.g.
            // port: function() { return 8282; }
            port: 8282,

            // the host ip address
            // If specified to, for example, "127.0.0.1" the server will
            // only be available on that ip.
            // Specify "0.0.0.0" to be available everywhere
            host: "0.0.0.0",

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
            port: 8282,

            // the host ip address
            // If specified to, for example, "127.0.0.1" the server will
            // only be available on that ip.
            // Specify "0.0.0.0" to be available everywhere
            host: "0.0.0.0",

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
                cert: "localhost.crt",
                key : "localhost.key"
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
        src:      ['partials/**.html', 'partials/modals/**.html'],
        dest:     'partials.js'
      }
    },
    watch: {
      scripts: {
        files: ['partials/*.html', 'partials/modals/*.html'],
        tasks: ['ngtemplates'],
        options: {
          livereload: true,
        }
      }
    },
    eslint: {
     target: ['Gruntfile.js', 'controllers/**.js', 'services/**.js', '**.js']
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
};
