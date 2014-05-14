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
                , dest: 'bin/SFAdapter-'+getBuildNumber()+'.zip'
            }
        }
        ,'copy': {
            main: {
                files: [
                    {expand: true, cwd: 'bin/', src: ['SFAdapter-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/SFAdapter/build_'+getCurrentTime()+'_'+getBuildNumber()}
                ]
            }
        }
        , shell: {
            prebuild: {
                command: 'prebuild.sh'
            },
            postbuild: {
                command: 'postbuild.sh'
            }
        }
    });

    var currentTime, buildNumber;

    function getCurrentTime() {
        if(!currentTime) {
            var date = new Date();
            var values = [ date.getDate(), date.getMonth() + 1, date.getHours(), date.getMinutes()];
            for (var i = 0; i < values.length; i++) {
                values[i] = values[i].toString().replace(/^([0-9])$/, '0$1');
            }
            currentTime = date.getFullYear()+values[1]+values[0]+"_"+values[2]+values[3];
            grunt.file.write('hud-buildid/buildtimestamp.txt', currentTime);
        }
        return currentTime;
    }

    function getBuildNumber() {
        if(!buildNumber) {
           buildNumber = grunt.file.read('hud-buildid/count.txt');
        }
        return buildNumber;
    }

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('build', ['concat', 'closure-compiler', 'zip']);
    grunt.registerTask('jenkins-build', ['concat', 'closure-compiler', 'zip', 'copy']);
};
