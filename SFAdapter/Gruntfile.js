module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'concat': {
            options: {
                separator: ''
            },
            dist: {
                src: [ 'src/js/build_number.js'
                    ,'src/js/salesforce_api/sf_api.js'
                    , 'src/js/salesforce_api/module.js'
                    , 'src/js/model/*.js'
                    , 'src/js/ui/controllers/commonController.js'
                    , 'src/js/ui/controllers/callController.js'
                    , 'src/js/ui/controllers/callsListController.js'
                    , 'src/js/ui/controllers/mainController.js'
                    , 'src/js/ui/controllers/newCallController.js'
                    , 'src/js/ui/controllers/transferDialog.js'
                    , 'src/js/ui/controllers/warningsController.js'
                    , 'src/js/ui/module.js'],
                dest: 'src/js/bin/fjs.sf.debug.js'
            }
        }

        , 'closure-compiler': {
            frontend: {
                closurePath: 'libs/compiler-latest',
                js: 'src/js/bin/fjs.sf.debug.js',
                jsOutputFile: 'src/js/bin/fjs.sf.min.js',
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }

        , 'zip': {
            'sfa-zip': {
                  cwd: 'src/'
                , src: ['src/js/bin/fjs.sf.min.js'
                    , 'src/js/build_number.js'
                    , 'src/index.html'
                    , 'src/css/*.css'
                    , 'src/templates/*.html'
                    , 'src/img/*.gif'
                    , 'src/img/*.png'
                    , 'src/properties.js']
                , dest: 'SFAdapter.zip'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
};
