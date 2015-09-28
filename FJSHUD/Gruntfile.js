module.exports = function(grunt) {

  var currentTime = getCurrentTime()
    , buildNumber;

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

  function getBuildNumber() {
    if(!buildNumber) {
      try {
        buildNumber = grunt.file.read('../hud-buildid/count.txt');
      }
      catch(e) {
        buildNumber = -1
      }
    }
    return buildNumber;
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
      }

    },
    template:{
      dist:{
          options:{
            data:{
              serverUrl:"https://fdp-huc-v5.fonality.com",
              loginUrl:"https://auth.fonality.com",
              version: "HUDW" + getBuildNumber(),
              WINDOWS_PLUGIN:'/webphone/WebPhone-1.1.011219.msi',
              MAC_PLUGIN:'/webphone/WebPhone-1.1.011218.pkg',
              WINDOWS_PLUGIN_VERSION:'1.1.011219',
              MAC_PLUGIN_VERSION:'1.1.011218',
            }
          },
          files:{
            'prod/app/properties.js':['app/properties.js'],
            'prod/app/index.version.html':['app/index.html']
          }
      },dev:{
        options:{
          data:{
            serverUrl:"https://dev4.fon9.com:8081",
            loginUrl: "https://dev4.fon9.com:5501",
            version: "HUDW" + getBuildNumber(),
            WINDOWS_PLUGIN:'/webphone/WebPhone-1.1.011219.msi',
            MAC_PLUGIN:'/webphone/WebPhone-1.1.011218.pkg',
            WINDOWS_PLUGIN_VERSION:'1.1.011219',
            MAC_PLUGIN_VERSION:'1.1.011218',
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
            version: "HUDW" + getBuildNumber(),
            WINDOWS_PLUGIN:'/webphone/WebPhone-1.1.011219.msi',
            MAC_PLUGIN:'/webphone/WebPhone-1.1.011218.pkg',
            WINDOWS_PLUGIN_VERSION:'1.1.011219',
            MAC_PLUGIN_VERSION:'1.1.011218',
          }
        },
          files:{
            'dest/app/properties.js':['app/properties.js'],
            'dest/app/index.version.html':['app/index.html']
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
          'dest/fjsmin.js': '<%= concat.dist.src %>'
        }
      },
      dist:{
        options:{
          mangle:false,
          beautify:false,
        },
        files:{
          'prod/app/scripts/fjs.min.js':['<%= concat.dist.dest %>']}
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
          {expand: true, src: ['app/bower_components/**/*'], dest: 'prod/app/'},
          {expand: true, src: ['server.js'], dest: 'prod/'},
          //{expand: true, src: ['app/properties.js'], dest: 'prod/'},
          {expand: true, src: ['ssl/*'], dest: 'prod/'},
          {expand: true, src: ['app/img/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/views/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/res/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/scripts/workers/**/*'], dest: 'prod/'},
          {expand: true, src: ['app/styles/fonts/**/*'], dest: 'prod/'},
          
        ]
      },
      dev: {
        files: [
          //{expand: true, cwd: 'bin/', src: ['HUDw-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/HUDw/build_'+getCurrentTime()+'_'+getBuildNumber()}
          {expand: true, src: ['app/bower_components/**/*'], dest: 'dest/app/'},
          {expand: true, src: ['server.js'], dest: 'dest/'},
          //{expand: true, src: ['app/properties.js'], dest: 'dest/'},
          {expand: true, src: ['ssl/*'], dest: 'dest/'},
          {expand: true, src: ['app/img/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/views/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/res/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/scripts/workers/**/*'], dest: 'dest/'},
          {expand: true, src: ['app/styles/fonts/**/*'], dest: 'dest/'},
          
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

  grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
  grunt.registerTask('build-dist', ['concat','template:dist','preprocess:dist','less:dist','uglify:dist','copy:dist','zip']);
  grunt.registerTask('build-alpha', ['concat','template:dev','preprocess:dev','less:dev','uglify:dev','copy:dev','zip']);
  grunt.registerTask('build-huc-dev', ['concat','template:huc_dev','preprocess:dev','less:dev','uglify:dev','copy:dev','zip']);
  
  grunt.registerTask('jenkins-build', ['string-replace', 'concat', 'closure-compiler', 'zip', 'copy']);
};
