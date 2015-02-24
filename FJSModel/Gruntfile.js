'use strict';

module.exports = function (grunt) {
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Show elapsed time at the end.
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    'version':{
          options: {
              release: 'patch'
          },
          defaults: {
              src: ['package.json', 'bower.json']
          }
    },
    banner: '/* <%= pkg.name %> - v<%= (grunt.file.readJSON("package.json")).version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed Fonality License */\n',
    // Task configuration.
      concat: {
          global: {
              options: {
                  separator: '\r\n'
              },
              src: ['src/fjs/model/_namespace.js',
                'src/fjs/model/EventsSource.js',
                'src/fjs/model/EntryModel.js',
                'src/fjs/model/FeedModel.js'
              ],
              dest: 'dist/<%= pkg.name %>.debug.js'
          }
      }
      ,'string-replace':
      {
          dist: {
              files: {
                  'dist/amd/<%= pkg.name %>.debug.js':'src/fjsmodel.js'
              },
              options: {
                  replacements: [
                      {
                        pattern: /{{lib}}/gm,
                        replacement: '<%= grunt.file.read("dist/"+pkg.name+".debug.js") %>'
                      }
                      ,
                      {
                          pattern: /{{banner}}/gm,
                          replacement: '<%= banner %>'
                      }
                  ]
              }
          }
      },
    'closure-compiler': {
      global: {
        closurePath: '../Tools/closure',
        js: 'dist/fjs.model.debug.js',
        jsOutputFile: 'dist/fjs.model.min.js',
        maxBuffer: 500,
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    },
    'karma': {
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    shell: {
      clear: {
        command: 'bower cache clean FJSModel'
      },
      install: {
        command: 'bower install'
      }
    }
    ,'clean': {
      js: ["bower_components/*"]
    }
  });

  // Default task.
  grunt.registerTask('default', ['clean', 'shell:clear', 'shell:install', /*'karma',*/ 'version', 'concat', 'string-replace', 'closure-compiler']);
};
