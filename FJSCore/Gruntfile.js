'use strict';

module.exports = function (grunt) {
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);
    // Show elapsed time at the end.
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        'pkg': grunt.file.readJSON('package.json'),
        'version':{
            options: {
                release: 'patch'
            },
            defaults: {
                src: ['package.json', 'bower.json']
            }
        },
        'banner': '/* <%= pkg.name %> - v<%= (grunt.file.readJSON("package.json")).version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed Fonality License */\n',
        // Task configuration.

        'concat': {
            core: {
                options: {separator: '\r\n'},
                src: ['src/fjs/core/Core.js'],
                dest: 'dist/amd/fjs.core.tmp.js'
            }, utils: {
                options: {separator: '\r\n'},
                src: ['src/fjs/utils/_namespace.js',
                  'src/fjs/utils/Array.js',
                  'src/fjs/utils/Browser.js',
                  'src/fjs/utils/Console.js',
                  'src/fjs/utils/Cookies.js',
                  'src/fjs/utils/GUID.js',
                  'src/fjs/utils/Increment.js',
                  'src/fjs/utils/JSON.js',
                  'src/fjs/utils/LocalStorage.js',
                  'src/fjs/utils/URL.js'
                ],
                dest: 'dist/amd/fjs.utils.tmp.js'
            }, ajax: {
                options: {separator: '\r\n'},
                src: ['src/fjs/ajax/_namespace.js',
                'src/fjs/ajax/AjaxProviderBase.js',
                'src/fjs/ajax/IFrameRequest.js',
                'src/fjs/ajax/IFrameAjax.js',
                'src/fjs/ajax/XDRAjax.js',
                'src/fjs/ajax/XHRAjax.js'
                ],
                dest: 'dist/amd/fjs.ajax.tmp.js'
            }, global: {
              options: {
                banner: '<%= banner %>',
                separator: '\r\n'
              },
              src: ['dist/amd/fjs.core.tmp.js'
                , 'dist/amd/fjs.utils.tmp.js'
                , 'dist/amd/fjs.ajax.tmp.js'
              ],
              dest: 'dist/<%= pkg.name %>.debug.js'
          }
        }, 'string-replace': {
            core: {
                files: {
                    'dist/amd/fjs.core.debug.js': 'src/fjscore.js'
                },
                options: {
                    replacements: [{
                            pattern: /{{lib}}/gm,
                            replacement: '<%= grunt.file.read("dist/amd/fjs.core.tmp.js") %>'
                        }, {
                            pattern: /{{banner}}/gm,
                            replacement: '<%=banner%>'
                        }
                    ]
                }
            }, utils: {
                files: {
                    'dist/amd/fjs.utils.debug.js': 'src/fjsutils.js'
                },
                options: {
                    replacements: [{
                            pattern: /{{lib}}/gm,
                            replacement: '<%= grunt.file.read("dist/amd/fjs.utils.tmp.js") %>'
                        }, {
                            pattern: /{{banner}}/gm,
                            replacement: '<%=banner%>'
                        }
                    ]
                }
            }, ajax: {
                files: {
                    'dist/amd/fjs.ajax.debug.js': 'src/fjsajax.js'
                },
                options: {
                    replacements: [{
                            pattern: /{{lib}}/gm,
                            replacement: '<%= grunt.file.read("dist/amd/fjs.ajax.tmp.js") %>'
                        }, {
                            pattern: /{{banner}}/gm,
                            replacement: '<%=banner%>'
                        }
                    ]
                }
            }
        },
        'clean': {
            js: ["dist/**/*.tmp.js"]
        },
      'closure-compiler': {
        global: {
          closurePath: '../Tools/closure',
          js: 'dist/fjs.core.debug.js',
          jsOutputFile: 'dist/fjs.core.min.js',
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
          command: 'bower cache clean FJSCore'
        }
      },
      jsdoc : {
        dist : {
          src: ['src/fjs/**/*.js'],
          options: {
            destination: 'doc'
          }
        }
      }
    });

    // Default task.
  grunt.registerTask('docs', ['jsdoc']);
  grunt.registerTask('default', ['karma', 'version', 'concat', 'string-replace', 'clean', 'shell:clear', 'closure-compiler']);
};
