// Karma configuration
// Generated on Tue Jul 29 2014 15:32:58 GMT+0700 (N. Central Asia Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'src/fjs/core/Core.js',
      'src/fjs/utils/_namespace.js',
      'src/fjs/utils/Array.js',
      'src/fjs/utils/Browser.js',
      'src/fjs/utils/Console.js',
      'src/fjs/utils/Cookies.js',
      'src/fjs/utils/GUID.js',
      'src/fjs/utils/Increment.js',
      'src/fjs/utils/JSON.js',
      'src/fjs/utils/LocalStorage.js',
      'src/fjs/utils/URL.js',
      'src/fjs/ajax/_namespace.js',
      'src/fjs/ajax/AjaxProviderBase.js',
      'src/fjs/ajax/IFrameRequest.js',
      'src/fjs/ajax/IFrameAjax.js',
      'src/fjs/ajax/XDRAjax.js',
      'src/fjs/ajax/XHRAjax.js',
      'test-main.js',
      {pattern: 'test/**/*Test.js', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/fjs/**/*.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9877,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'PhantomJS', 'IE'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
