module.exports = function(grunt) {

  //var currentTime = getCurrentTime()
  //  , buildNumber;
  //
  //grunt.file.write('../hud-buildid/buildtimestamp.txt', currentTime);
  //
  //function getCurrentTime() {
  //  if(!currentTime) {
  //    var date = new Date();
  //    var values = [ date.getDate(), date.getMonth() + 1, date.getHours(), date.getMinutes()];
  //    for (var i = 0; i < values.length; i++) {
  //      values[i] = values[i].toString().replace(/^([0-9])$/, '0$1');
  //    }
  //    currentTime = date.getFullYear()+values[1]+values[0]+"_"+values[2]+values[3];
  //  }
  //  return currentTime;
  //}
  //
  //function getBuildNumber() {
  //  if(!buildNumber) {
  //    buildNumber = grunt.file.read('../hud-buildid/count.txt');
  //  }
  //  return buildNumber;
  //}

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'concat': {
      options: {
        separator: ';'
      },
      dist: {
        src: [ "app/scripts/model/entryModel.js",
        "app/scripts/model/feedModel.js",
        "app/scripts/model/custom/meFeedModel.js",
        "app/scripts/model/custom/contactEntryModel.js",
        "app/scripts/model/custom/contactsFeedModel.js",
        "app/scripts/model/custom/conferenceEntryModel.js",
        "app/scripts/model/custom/conferenceFeedModel.js",
        "app/scripts/model/custom/conferenceMemberEntryModel.js",
        "app/scripts/model/custom/conferenceMemberFeedModel.js",
        "app/scripts/model/custom/groupEntryModel.js",
        "app/scripts/model/custom/groupFeedModel.js",
        "app/scripts/model/custom/voicemailMessageEntryModel.js",
        "app/scripts/model/custom/voicemailMessageFeedModel.js",
        "app/scripts/model/custom/myCallEntryModel.js",
        "app/scripts/model/custom/myCallFeedModel.js",
        "app/scripts/model/custom/widgetHistoryEntryModel.js",
        "app/scripts/model/custom/widgetHistoryFeedModel.js",
        "app/scripts/model/custom/streameventEntryModel.js",
        "app/scripts/model/custom/streameventFeedModel.js",
        "app/scripts/model/client/clientFeedModel.js",
        "app/scripts/model/client/sortingEntryModel.js",
        "app/scripts/model/client/sortingFeedModel.js",
        "app/scripts/model/filters/contactsWithoutMeFilter.js",
        "app/scripts/model/filters/sortConferenceFilter.js",
        "app/scripts/model/filters/sortVoicemailFilter.js",
        "app/scripts/model/filters/externalContactsFilter.js",
        "app/scripts/model/filters/durationFormatFilter.js",
        "app/scripts/model/filters/resentsSortFilter.js",
        "app/scripts/model/filters/chatFilter.js",
        "app/scripts/model/filters/contactVoicemailsFilter.js",
        "app/scripts/model/actions/actionEntryModel.js",
        "app/scripts/model/actions/actionContactCallExtension.js",
        "app/scripts/model/actions/actionContactCallMobile.js",
        "app/scripts/model/actions/actionContactChat.js",
        "app/scripts/model/actions/actionContactEmail.js",
        "app/scripts/model/actions/actionContactIntercom.js",
        "app/scripts/model/actions/actionContactVoicemail.js",
        "app/scripts/model/actions/actionScreenShare.js",
        "app/scripts/model/actions/actionContactFileShare.js",
        "app/scripts/model/actions/actionContactUnpin.js",
        "app/scripts/model/actions/actionsManager.js",
        "app/scripts/model/dataManager.js",
        "app/scripts/model/module.js",
        "app/scripts/react/ContextMenu.js",
        "app/scripts/react/ContactsList.js",
        "app/scripts/direcives/contextMenuDirective.js",
        "app/scripts/direcives/contextMenuDialogDirective.js",
        "app/scripts/direcives/avatarMenuDirective.js",
        "app/scripts/direcives/contactsListDirective.js",
        "app/scripts/direcives/unpinDirective.js",
        "app/scripts/direcives/module.js",
        "app/scripts/controllers/base/Controller.js",
        "app/scripts/controllers/base/SortableController.js",
        "app/scripts/controllers/base/SortMenuController.js",
        "app/scripts/controllers/base/ActionMenuController.js",
        "app/scripts/controllers/MainController.js",
        "app/scripts/controllers/TopNavigationController.js",
        "app/scripts/controllers/TopBarMeStatusController.js",
        "app/scripts/controllers/MeWidgetController.js",
        "app/scripts/controllers/LocationsController.js",
        "app/scripts/controllers/base/AddContactMenuController.js",
        "app/scripts/controllers/ZoomWidgetController.js",
        "app/scripts/controllers/ContactsWidget.js",
        "app/scripts/controllers/ConferencesWidgetController.js",
        "app/scripts/controllers/LeftBarContactsController.js",
        "app/scripts/controllers/GroupsTab.js",
        "app/scripts/controllers/VoicemailTab.js",
        "app/scripts/controllers/EditContactDialog.js",
        "app/scripts/controllers/ConversationWidgetController.js",
        "app/scripts/controllers/ConversationWidgetGroupsController.js",
        "app/scripts/controllers/ConversationWidgetVoicemailsController.js",
        "app/scripts/controllers/ConversationWidgetQueuesController.js",
        "app/scripts/controllers/ConversationWidgetVoicemailsController.js",
        "app/scripts/controllers/ConversationWidgetGroupsController.js",
        "app/scripts/controllers/ContactWidgetChatController.js",
        "app/scripts/controllers/ContactWidgetGroupsController.js",
        "app/scripts/controllers/ConversationWidgetCallLogController.js",
        "app/scripts/controllers/TestWidgetController.js",
        "app/scripts/controllers/SearchInputController.js",
        "app/scripts/controllers/MyCallController.js",
        "app/scripts/controllers/RecentsListController.js",
        "app/scripts/controllers/RecentItemController.js",
        "app/scripts/controllers/ChatController.js",
        "app/scripts/controllers/contextMenuController.js",
        "app/scripts/controllers/ChatStatusController.js",
        "app/scripts/controllers/LeftBarController.js",
        "app/scripts/controllers/LeftBarCallsController.js"
      ],
        dest: 'app/scripts/fjs.hud.debug.js'
      }
    }

    , 'closure-compiler': {
      frontend: {
        closurePath: '../Tools/closure',
        js: 'app/scripts/fjs.hud.debug.js',
        jsOutputFile: 'app/scripts/fjs.hud.min.js',
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    }

    //, 'zip': {
    //  'sfa-zip': {
    //    cwd: 'src/'
    //    , src: ['src/js/bin/fjs.sf.min.js'
    //      , 'src/js/build_number.js'
    //      , 'src/js/lib/*.js'
    //      , 'src/index.html'
    //      , 'src/debug.html'
    //      , 'src/cookiesHack.html'
    //      , 'src/cookiesHack2.html'
    //      , 'src/css/*.css'
    //      , 'src/templates/*.html'
    //      , 'src/img/*.gif'
    //      , 'src/img/*.png'
    //      , 'src/fonts/*'
    //      , 'src/properties.js'
    //      , 'src/js/salesforce_api/sf_api.js'
    //      , 'src/js/salesforce_api/module.js'
    //      , 'src/js/salesforce_api/SFSimpleProvider.js'
    //      , 'src/js/salesforce_api/SFSharedWorkerProvider.js'
    //      , 'src/js/salesforce_api/SFApiProviderFactory.js'
    //      , 'src/js/model/feedModel.js'
    //      , 'src/js/model/entryModel.js'
    //      , 'src/js/model/MeModel.js'
    //      , 'src/js/model/myCallEntryModel.js'
    //      , 'src/js/model/myCallsFeedModel.js'
    //      , 'src/js/model/clientSettingsFeedModel.js'
    //      , 'src/js/model/filters/whatFilter.js'
    //      , 'src/js/model/filters/whoFilter.js'
    //      , 'src/js/model/filters/sortRelatedFields.js'
    //      , 'src/js/model/dataManager.js'
    //      , 'src/js/model/module.js'
    //      , 'src/js/ui/controllers/commonController.js'
    //      , 'src/js/ui/controllers/callController.js'
    //      , 'src/js/ui/controllers/callsListController.js'
    //      , 'src/js/ui/controllers/mainController.js'
    //      , 'src/js/ui/controllers/newCallController.js'
    //      , 'src/js/ui/controllers/transferDialog.js'
    //      , 'src/js/ui/controllers/warningsController.js'
    //      , 'src/js/ui/controllers/dialpadController.js'
    //      , 'src/js/ui/module.js'
    //    ]
    //    , dest: 'bin/SFAdapter-'+getBuildNumber()+'.zip'
    //  }
    //}
    //, 'string-replace':{
    //  kit: {
    //    files: {
    //      'src/js/build_number.js':'src/js/build_number.js'
    //    },
    //    options: {
    //      replacements: [{
    //        pattern: /manual/gm,
    //        replacement: getBuildNumber()
    //      }]
    //    }
    //  }
    //}
    //,'copy': {
    //  main: {
    //    files: [
    //      {expand: true, cwd: 'bin/', src: ['SFAdapter-'+getBuildNumber()+'.zip'], dest: '/media/storage/build/SFAdapter/build_'+getCurrentTime()+'_'+getBuildNumber()}
    //    ]
    //  }
    //}
  });


  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['concat', 'closure-compiler'/*, 'zip'*/]);
  grunt.registerTask('jenkins-build', ['string-replace', 'concat', 'closure-compiler', 'zip', 'copy']);
};
