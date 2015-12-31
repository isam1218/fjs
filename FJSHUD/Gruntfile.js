module.exports = function(grunt) {

  var currentTime = getCurrentTime()
    , buildNumber, WebphoneOSXNumber, WebphoneMSINumber, ServerUrl, LoginUrl, PpsServer;
  grunt.file.write('../hud-buildid/buildtimestamp.txt', currentTime);

  function getCurrentTime() {
    if(!currentTime) {
      var date = new Date();
      var values = [ date.getDate(), date.getMonth() + 1, date.getHours(), date.getMinutes()];
      for (var i = 0; i < values.length; i++) {
        values[i] = values[i].toString().replace(/^([0-9])$/, '0$1');
      }
      currentTime = date.getFullYear()+values[1]+values[0]+"_"+values[2]+values[3];
    }
    return currentTime;
  }
/* build number */
  function getBuildNumber() {
    if(!buildNumber) {
      try {
        buildNumber = grunt.file.read('../build_number');
      }
      catch(e) {
        buildNumber = -1
      }
    }
    return buildNumber;
  }
/* webphone msi version */
  function getWebphoneMSINumber() {
    if(!WebphoneMSINumber) {
      try {
        WebphoneMSINumber = grunt.file.read('../msi_number');
      }
      catch(e) {
        WebphoneMSINumber = -1
      }
    }
    return WebphoneMSINumber;
  }
/* webphone osx version */
  function getWebphoneOSXNumber() {
    if(!WebphoneOSXNumber) {
      try {
        WebphoneOSXNumber = grunt.file.read('../osx_number');
      }
      catch(e) {
        WebphoneOSXNumber = -1
      }
    }
    return WebphoneOSXNumber;
  }
/* server url */
  function getServerUrl() {
    if(!ServerUrl) {
      try {
        ServerUrl = grunt.file.read('../server_url');
      }
      catch(e) {
        ServerUrl = -1
      }
    }
    return ServerUrl;
  }
/* login url */
  function getLoginUrl() {
    if(!LoginUrl) {
      try {
        LoginUrl = grunt.file.read('../login_url');
      }
      catch(e) {
        LoginUrl = -1
      }
    }
    return LoginUrl;
  }
/* pps server */
  function getPpsServer() {
    if(!PpsServer) {
      try {
        PpsServer = grunt.file.read('../pps_server');
      }
      catch(e) {
        PpsServer = -1
      }
    }
    return PpsServer;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    'jshint':{
      jsFiles:['app/**/*.js']
    },
    preprocess:{
      dev:{
        options:{
            context:{
              NODE_ENV:'development'
            }
        },
        files:{
            'dest/app/index.html':'app/index.html'
        }
      },
      dist:{
        options:{
            context:{
                NODE_ENV:'production'
            }
        },
        files:{
            'prod/app/index.html':'prod/app/index.version.html'
        }
      },
      huc_dev:{
        options:{
            context:{
                NODE_ENV:'development'
            }
        },
        files:{
            'huc_dev/app/index.html':'huc_dev/app/index.version.html'
        }
      }

    },
    ngtemplates: {
      fjshudApp: {
        options:{
          standalone:false,
          module:'fjshudApp',
		  htmlmin: {
			collapseWhitespace: true,
			conservativeCollapse: true
		  }
        },
        cwd: 'app',
        src: ['views/**.html', 'views/**/**.html'],
        dest: 'prod/app/scripts/templates.js'
      }
    },
    bower_concat: {
      dist: {
        dest: 'app/scripts/bower.js'
      }
    },
    template:{
      dist:{
          options:{
            data:{
              serverUrl:"https://fdp-huc-v5.fonality.com",
              loginUrl:"https://auth.fonality.com",
              ppsServer: "unknown_atm",
              version: "HUDW" + getBuildNumber(),
              WINDOWS_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneMSINumber() + ".msi",
              MAC_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneOSXNumber() + ".pkg",
              WINDOWS_PLUGIN_VERSION:"1.1.0" + getWebphoneMSINumber(),
              MAC_PLUGIN_VERSION:"1.1.0" + getWebphoneOSXNumber(),
            }
          },
          files:{
            'prod/app/properties.js':['app/properties.js'],
            'prod/app/index.version.html':['app/index.html']
          }
      },dev:{
        options:{
          data:{
            serverUrl: getServerUrl(),
            loginUrl: getLoginUrl(),
            ppsServer: getPpsServer(),
            version: "HUDW" + getBuildNumber(),
            WINDOWS_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneMSINumber() + ".msi",
            MAC_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneOSXNumber() + ".pkg",
            WINDOWS_PLUGIN_VERSION:"1.1.0" + getWebphoneMSINumber(),
            MAC_PLUGIN_VERSION:"1.1.0" + getWebphoneOSXNumber(),
          }
        },
          files:{
            'dest/app/properties.js':['app/properties.js'],
            'dest/app/index.version.html':['app/index.html']
          }
      },
      huc_dev:{
        options:{
          data:{
            serverUrl:"https://huc-dev.fonality.com:8081",
            loginUrl: "https://huc-dev.fonality.com:5501",
            ppsServer: getPpsServer(),
            version: "HUDW" + getBuildNumber(),
            WINDOWS_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneMSINumber() + ".msi",
            MAC_PLUGIN:"webphone/WebPhone-1.1.0" + getWebphoneOSXNumber() + ".pkg",
            WINDOWS_PLUGIN_VERSION:"1.1.0" + getWebphoneMSINumber(),
            MAC_PLUGIN_VERSION:"1.1.0" + getWebphoneOSXNumber(),
          }
        },
          files:{
            'huc_dev/app/properties.js':['app/properties.js'],
            'huc_dev/app/index.version.html':['app/index.html']
          }
      }
    },
    less:{
      dist:{
        options:{
          compress:true
        },
        files:{
          "prod/app/styles/main.css":"app/styles/main.less",
          "prod/app/styles/nativeAlert.css": "app/styles/nativeAlert.less",
          "prod/app/styles/firefox.css": "app/styles/firefox.less",
          "prod/app/styles/safari.css": "app/styles/safari.less",
          "prod/app/styles/ie.css": "app/styles/ie.less"
        },
      },
      dev:{
        options:{
          compress:true
        },
        files:{
          "dest/app/styles/main.css":"app/styles/main.less",
          "dest/app/styles/nativeAlert.css": "app/styles/nativeAlert.less",
          "dest/app/styles/firefox.css": "app/styles/firefox.less",
          "dest/app/styles/safari.css": "app/styles/safari.less",
          "dest/app/styles/ie.css": "app/styles/ie.less"
        },
      },
      huc_dev:{
        options:{
          compress:true
        },
        files:{
          "huc_dev/app/styles/main.css":"app/styles/main.less",
          "huc_dev/app/styles/nativeAlert.css": "app/styles/nativeAlert.less",
          "huc_dev/app/styles/firefox.css": "app/styles/firefox.less",
          "huc_dev/app/styles/safari.css": "app/styles/safari.less",
          "huc_dev/app/styles/ie.css": "app/styles/ie.less"
        },
      }
    },
    'concat': {
      options: {
        separator: ';'
      },
      dist: {
        src: [
        'app/languageMap.js',
        'app/scripts/app.js',
        'app/scripts/filters/**/*.js',
        'app/scripts/directives/**/*.js',
        'app/scripts/controllers/**/*.js',
        'app/scripts/services/**/*.js',
        'app/scripts/factory/**/*.js'
        ],
        dest: 'app/scripts/fjs.min.js'
      }
    }
    , 
    uglify:{
      dev:{
        options:{
          mangle:false,
          beautify:true,
        },
        files:{
          'dest/fjsmin.js': '<%= concat.dist.src %>',

        }
      },
      dist:{
        options:{
          mangle:false,
          beautify:false,
          compress:true,
        },
        files:{
          'prod/app/scripts/fjs.min.js':['<%= concat.dist.dest %>'],
          'prod/app/scripts/bower.min.js':['app/scripts/bower.js']
        }
      },
      huc_dev:{
        options:{
          mangle:false,
          beautify:false,
        },
        files:{
          'huc_dev/app/scripts/fjs.min.js':['<%= concat.dist.dest %>']}
      }
    },
    'closure-compiler': {
      frontend: {
        closurePath: '../Tools/closure',
        js: 'app/scripts/fjs.hud.debug.js',
        jsOutputFile: 'app/scripts/fjs.hud.min.js',
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    }

    , 'zip': {
      'sfa-zip': {
        cwd: ''
        , src: ['app/**/*'
          , 'bower_components/**/*'
        ]
        , dest: 'bin/HUDw-'+getBuildNumber()+'.zip'
      }
    }
    , 'string-replace':{
      kit: {
        files: {
          'src/js/build_number.js':'src/js/build_number.js'
        },
        options: {
          replacements: [{
            pattern: /manual/gm,
            replacement: getBuildNumber()
          }]
        }
      }
    }
    ,'copy': {
      dist: {
        files: [
          //{expand: true, cwd: 'bin/', src: ['HUDw-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/HUDw/build_'+getCurrentTime()+'_'+getBuildNumber()}
          {expand: true, src: ['app/bower_components/**/*'], dest: 'prod/'},
          {expand: true, src: ['server.js'], dest: 'prod/'},
          //{expand: true, src: ['app/properties.js'], dest: 'prod/'},
          {expand: true, src: ['ssl/*'], dest: 'prod/'},
          {expand: true, src: ['app/img/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/views/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/res/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/scripts/workers/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/styles/fonts/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/styles/*.css'], dest: 'dest/'},

        ]
      },
      dev: {
        files: [
          //{expand: true, cwd: 'bin/', src: ['HUDw-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/HUDw/build_'+getCurrentTime()+'_'+getBuildNumber()}
          {expand: true, src: ['app/bower_components/**/*'], dest: 'dest/'},
          {expand: true, src: ['server.js'], dest: 'dest/'},
          //{expand: true, src: ['app/properties.js'], dest: 'dest/'},
          {expand: true, src: ['ssl/*'], dest: 'dest/'},
          {expand: true, src: ['app/img/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/views/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/res/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/scripts/workers/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/styles/fonts/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/styles/*.css'], dest: 'dest/'},
          {expand: true, src: [
             'app/languageMap.js',
              'app/scripts/app.js',
              'app/scripts/filters/**/*.js',
              'app/scripts/directives/**/*.js',
              'app/scripts/controllers/**/*.js',
              'app/scripts/services/**/*.js',
              'app/scripts/factory/**/*.js'
          ], dest: 'dest/'},
        
        ]
      },
      huc_dev: {
        files: [
          //{expand: true, cwd: 'bin/', src: ['HUDw-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/HUDw/build_'+getCurrentTime()+'_'+getBuildNumber()}
          {expand: true, src: ['app/bower_components/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['server.js'], dest: 'huc_dev/'},
          //{expand: true, src: ['app/properties.js'], dest: 'dest/'},
          {expand: true, src: ['ssl/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/img/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/views/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/res/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/scripts/workers/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/styles/fonts/**/*'], dest: 'huc_dev/'},
          {expand: true, src: ['app/styles/*.css'], dest: 'dest/'},
          
          {expand: true, src: [
             'app/languageMap.js',
              'app/scripts/app.js',
              'app/scripts/filters/**/*.js',
              'app/scripts/directives/**/*.js',
              'app/scripts/controllers/**/*.js',
              'app/scripts/services/**/*.js',
              'app/scripts/factory/**/*.js'
          ], dest: 'huc_dev/'},
        
        ]
      }
    }
  });


  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-bower-concat');

  
  grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
  grunt.registerTask('build-dist', ['template:dist','concat','ngtemplates','bower_concat','preprocess:dist','less:dist','uglify:dist','copy:dist','zip']);
  grunt.registerTask('build-alpha', ['concat','template:dev','preprocess:dev','less:dev','uglify:dev','copy:dev','zip']);
  grunt.registerTask('build-huc-dev', ['concat','template:huc_dev','preprocess:huc_dev','less:huc_dev','uglify:huc_dev','copy:huc_dev','zip']);
  grunt.registerTask('jenkins-build', ['string-replace', 'concat', 'closure-compiler', 'zip', 'copy']);
};
