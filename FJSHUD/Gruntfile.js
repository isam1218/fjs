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
        src: 'app/index.html',
        dest: 'dest/index.html'
        
      }
    },

    less:{
      dist:{
        files:{
          "dest/styles/main.css":"app/styles/main.less",
          "dest/styles/nativeAlert.css": "app/styles/nativeAlert.less"
        }
      }
    },
    'concat': {
      options: {
        separator: ';'
      },
      dist: {
        src: [ 
        'app/properties.js',
        'app/languageMap.js',
        'app/scripts/app.js',
        'app/scripts/filters/**/*.js',
        'app/scripts/directives/**/*.js',
        'app/scripts/controllers/**/*.js',
        'app/scripts/services/**/*.js',
        'app/scripts/factory/**/*.js'
      ],
        dest: 'app/scripts/fjs.hud.debug.js'
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
          'dest/fjsmin.js':['<%= concat.dist.dest %>']}
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
      main: {
        files: [
          {expand: true, cwd: 'bin/', src: ['HUDw-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/HUDw/build_'+getCurrentTime()+'_'+getBuildNumber()}
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

  grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
  grunt.registerTask('build-dist', ['concat','preprocess:dev','less','uglify:dist', 'zip']);
  
  grunt.registerTask('jenkins-build', ['string-replace', 'concat', 'closure-compiler', 'zip', 'copy']);
};
