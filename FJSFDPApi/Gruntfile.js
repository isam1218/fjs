/**
 * @param {{initConfig:function, loadNpmTasks:function, registerTask: function}} grunt
 */
module.exports = function(grunt) {
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),

        'concat': {
            options: {
                separator: ''
            },
            dist: {
                src: ['src/providers/DataProviderBase.js'
                    , 'src/providers/SimpleClientDataProvider.js'
                    , 'src/providers/WebWorkerDataProvider.js'
                    , 'src/providers/SharedWorkerDataProvider.js'
                    , 'src/FDPProviderFactory.js'
                    , 'src/TabsSyncronizer.js'
                ],
                dest: 'bin/fjs.fdp.api.debug.js'
            }
        }
        , 'closure-compiler': {
            frontend: {
                closurePath: '../tools/closure',
                js: 'bin/fjs.fdp.api.debug.js',
                jsOutputFile: 'bin/fjs.fdp.api.min.js',
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }
        , 'string-replace':{
            kit: {
                files: {
                    'bin/fjs.fdp.api.min.js': 'bin/fjs.fdp.api.min.js'
                    , 'src/fdp_shared_worker.js':'src/fdp_shared_worker_min.js'
                },
                options: {
                    replacements: [{
                            pattern: /fjs\.fdp\.debug\.js/gm,
                            replacement: 'fjs.fdp.min.js'
                        }
                        , {
                                pattern: /fjs\.core\.debug\.js/gm,
                                replacement: 'fjs.core.min.js'
                        }
                        , {
                                pattern: /fdp_shared_worker\.js/gm,
                                replacement: 'fdp_shared_worker_min.js'
                        }
                    ]
                }
            }
        }
        , 'copy': {
            dev: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_shared_worker.js'], dest: '../SFAdapter/src/js/lib/'}
                ]
            }
            , main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.min.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_shared_worker.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.min.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_shared_worker.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.min.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_shared_worker.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_shared_worker_min.js'], dest: '../SFAdapter/src/js/lib/'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('devbuild', ['concat', 'copy:dev']);
    grunt.registerTask('build', ['concat', 'closure-compiler', 'string-replace', 'copy:main']);
    grunt.registerTask('jenkins-build', ['concat', 'closure-compiler', 'copy:main']);
};
