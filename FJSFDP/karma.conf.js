// Karma configuration
// Generated on Fri Aug 01 2014 12:34:28 GMT+0700 (N. Central Asia Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/FJSCore/dist/fjs.core.debug.js',
      'bower_components/FJSModel/dist/fjs.model.debug.js',
      'bower_components/FJSDB/dist/fjs.db.debug.js',
      'bower_components/FJSTabs/dest/fjs.tabs.debug.js',
      'src/fjs/fdp/model/_namespace.js'
        , 'src/fjs/fdp/model/EntryChangeModel.js'
        , 'src/fjs/fdp/model/EntryChange.js'
        , 'src/fjs/fdp/model/EntryModel.js'
        , 'src/fjs/fdp/model/ProxyModel.js'
        , 'src/fjs/fdp/model/ClientFeedProxyModel.js'

        , 'src/fjs/fdp/transport/_namespace.js'
        , 'src/fjs/fdp/transport/FDPTransport.js'
        , 'src/fjs/fdp/transport/AJAXTransport.js'
        , 'src/fjs/fdp/transport/XHRTransport.js'
        , 'src/fjs/fdp/transport/XDRTransport.js'
        , 'src/fjs/fdp/transport/IframeTransport.js'
        , 'src/fjs/fdp/transport/LocalStorageTransport.js'
        , 'src/fjs/fdp/transport/TransportFactory.js'

        , 'src/fjs/fdp/_namespace.js'
        , 'src/fjs/fdp/SyncManager.js'
        , 'src/fjs/fdp/DataManager.js'
        , 'test/testClasses/*.js'
        , 'test-main.js',
      {pattern: 'test/**/*Test.js', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: {
          'src/fjs/fdp/**/*.js': ['coverage']
      },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],//['Chrome', 'IE', 'Opera', 'PhantomJS', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
