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
                    , 'src/sync/*.js'],
                dest: 'bin/fjs.fdp.debug.js'
            }
        }
        , 'karma': {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('build', ['concat']);
};
