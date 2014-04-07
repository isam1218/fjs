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
                src: ['src/db/IndexedDBProvider.js'
                    , 'src/db/WebSQLProvider.js'
                    , 'src/db/LocalStorageDBProvider.js'
                    , 'src/db/DBFactory.js'
                    , 'src/models/EntryModel.js'
                    , 'src/models/ProxyModel.js'
                    , 'src/models/contactsProxyModel.js'
                    , 'src/models/ClientFeedProxyModel.js'
                    , 'src/transport/FDPTransport.js'
                    , 'src/transport/AJAXTransport.js'
                    , 'src/transport/XHRTransport.js'
                    , 'src/transport/XDRTransport.js'
                    , 'src/transport/IframeTransport.js'
                    , 'src/transport/LocalStorageTransport.js'
                    , 'src/transport/TransportFactory.js'
                    , 'src/sync/TabsSyncronizer.js'
                    , 'src/sync/SyncManager.js'
                    , 'src/sync/DataManager.js'

                ],
                dest: 'bin/fjs.fdp.debug.js'
            }
        }
        , 'copy': {
            main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.fdp.debug.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.debug.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'src/', src: ['properties.js'], dest: '../FJSHUD/src/js/lib/'}
                ]
            }
        }

//        , 'karma': {
//            unit: {
//                configFile: 'karma.conf.js'
//            }
//        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', ['concat', 'copy']);
};
