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
                src: ['src/fjs/db/IndexedDBProvider.js'
                    , 'src/fjs/db/WebSQLProvider.js'
                    , 'src/fjs/db/LocalStorageDBProvider.js'
                    , 'src/fjs/db/DBFactory.js'
                    , 'src/fjs/fdp/model/EntryModel.js'
                    , 'src/fjs/fdp/model/ProxyModel.js'
                    , 'src/fjs/fdp/model/contactsProxyModel.js'
                    , 'src/fjs/fdp/model/ClientFeedProxyModel.js'
                    , 'src/fjs/fdp/transport/FDPTransport.js'
                    , 'src/fjs/fdp/transport/AJAXTransport.js'
                    , 'src/fjs/fdp/transport/XHRTransport.js'
                    , 'src/fjs/fdp/transport/XDRTransport.js'
                    , 'src/fjs/fdp/transport/IframeTransport.js'
                    , 'src/fjs/fdp/transport/LocalStorageTransport.js'
                    , 'src/fjs/fdp/transport/TransportFactory.js'
                    , 'src/fjs/fdp/TabsSyncronizer.js'
                    , 'src/fjs/fdp/SyncManager.js'
                    , 'src/fjs/fdp/DataManager.js'

                ],
                dest: 'bin/fjs.fdp.debug.js'
            }
        }
        , 'closure-compiler': {
            frontend: {
                closurePath: '../tools/closure',
                js: 'bin/fjs.fdp.debug.js',
                jsOutputFile: 'bin/fjs.fdp.min.js',
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }
        , 'copy': {
            main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.fdp.debug.js'], dest: '../FJSHUD/src/fjs/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.debug.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.debug.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.min.js'], dest: '../FJSHUD/src/fjs/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.min.js'], dest: '../SFAdapter/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.min.js'], dest: '../FJSHUD/bin/'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-closure-compiler');

    grunt.registerTask('build', ['concat', 'closure-compiler', 'copy']);
};
