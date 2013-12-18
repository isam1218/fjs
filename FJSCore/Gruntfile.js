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
                src: ['src/oop.js'
                    , 'src/utils/*.js'
                    , 'src/ajax/XHRAjax.js'],
                dest: 'bin/fjs.core.debug.js'
            }
        }
        , 'copy': {
            main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['fjs.core.debug.js'], dest: '../FJSFDP/lib/'}

                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['concat', 'copy']);
};
