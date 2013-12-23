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
                src: ['src/providers/ClientDataProviderBase.js'
                    , 'src/providers/SimpleClientDataProvider.js'
                    , 'src/providers/WebWorkerDataProvider.js'],
                dest: 'bin/fjs.fdp.api.debug.js'
            }
        }
        , 'copy': {
            main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../FJSHUD/src/js/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.fdp.api.debug.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'src/', src: ['fdp_worker.js'], dest: '../FJSHUD/bin/'}
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
