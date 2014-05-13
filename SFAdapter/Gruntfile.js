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
                    , 'src/js/salesforce_api/sf_api.js'
                    , 'src/js/salesforce_api/SFSimpleProvider.js'
                    , 'src/js/salesforce_api/SFSharedWorkerProvider.js'
                    , 'src/js/salesforce_api/SFApiProviderFactory.js'
                    , 'src/js/salesforce_api/module.js'
                    , 'src/js/model/feedModel.js'
                    , 'src/js/model/entryModel.js'
                    , 'src/js/model/MeModel.js'
                    , 'src/js/model/myCallsFeedModel.js'
                    , 'src/js/model/dataManager.js'
                    , 'src/js/model/module.js'
                    , 'src/js/ui/controllers/commonController.js'
                    , 'src/js/ui/controllers/callController.js'
                    , 'src/js/ui/controllers/callsListController.js'
                    , 'src/js/ui/controllers/mainController.js'
                    , 'src/js/ui/controllers/newCallController.js'
                    , 'src/js/ui/controllers/transferDialog.js'
                    , 'src/js/ui/controllers/warningsController.js'
                    , 'src/js/ui/controllers/dialpadController.js'
                    , 'src/js/ui/module.js'],
                dest: 'src/js/bin/fjs.sf.debug.js'
            }
        }

        , 'closure-compiler': {
            frontend: {
                closurePath: '../tools/closure',
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
                    , 'src/js/lib/*.js'
                    , 'src/index.html'
                    , 'src/debug.html'
                    , 'src/css/*.css'
                    , 'src/templates/*.html'
                    , 'src/img/*.gif'
                    , 'src/img/*.png'
                    , 'src/properties.js'
                    , 'src/js/salesforce_api/sf_api.js'
                    , 'src/js/salesforce_api/module.js'
                    , 'src/js/salesforce_api/SFSimpleProvider.js'
                    , 'src/js/salesforce_api/SFSharedWorkerProvider.js'
                    , 'src/js/salesforce_api/SFApiProviderFactory.js'
                    , 'src/js/model/feedModel.js'
                    , 'src/js/model/entryModel.js'
                    , 'src/js/model/MeModel.js'
                    , 'src/js/model/myCallsFeedModel.js'
                    , 'src/js/model/dataManager.js'
                    , 'src/js/model/module.js'
                    , 'src/js/ui/controllers/commonController.js'
                    , 'src/js/ui/controllers/callController.js'
                    , 'src/js/ui/controllers/callsListController.js'
                    , 'src/js/ui/controllers/mainController.js'
                    , 'src/js/ui/controllers/newCallController.js'
                    , 'src/js/ui/controllers/transferDialog.js'
                    , 'src/js/ui/controllers/warningsController.js'
                    , 'src/js/ui/controllers/dialpadController.js'
                    , 'src/js/ui/module.js'
                ]
                , dest: 'SFAdapter.zip'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
    grunt.registerTask('jenkins-build', ['concat', 'closure-compiler', 'zip']);
};
