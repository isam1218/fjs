/**
 * @param {{initConfig:function, loadNpmTasks:function, registerTask: function}} grunt
 */
module.exports = function(grunt) {
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        //we will join
        'concat': {
            options: {
                separator: ''
            },
            dist: {
                //this files
                src: ['src/oop.js'
                    , 'src/utils/*.js'
                    , 'src/ajax/XHRAjax.js'],
                //to this
                dest: 'bin/fjs.core.debug.js'
            }
        }
        //and copy
        , 'copy': {
            main: {
                files: [
                    //to 3 derictories
                    {expand: true, cwd: 'bin/', src: ['fjs.core.debug.js'], dest: '../FJSFDP/lib/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.core.debug.js'], dest: '../FJSHUD/bin/'}
                    , {expand: true, cwd: 'bin/', src: ['fjs.core.debug.js'], dest: '../FJSHUD/src/js/lib/'}

                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['concat', 'copy']);
};
