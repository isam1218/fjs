'use strict';

/**
 * @ngdoc overview
 * @name fjshudApp
 * @description
 * # fjshudApp
 *
 * Main module of the application.
 */
var hud_web = angular
  .module('fjshudApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'HUD_model',
    'HUD_Dir'
  ]);
hud_web.config(function ($routeProvider) {
    $routeProvider.
        when('/settings', {templateUrl: 'views/MeWidgetController.html',   controller:['$scope', 'DataManager', fjs.ui.MeWidgetController]}).
        when('/settings/weblauncer', {templateUrl: 'views/SettingsWebLauncer.html',   controller:['$scope', 'DataManager', fjs.ui.MeWidgetController]}).
        when('/settings/account', {templateUrl: 'views/SettingsAccount.html',   controller:['$scope', 'DataManager', fjs.ui.MeWidgetController]}).
        when('/contacts', {templateUrl: 'views/ContactsWidget.html',   controller:['$scope',  'DataManager', fjs.ui.ContactsWidget]}).
        when('/contacts/groups', {templateUrl: 'views/GroupsWidget.html',   controller:['$scope',  '$rootScope', 'DataManager', fjs.ui.GroupsController]}).
        when('/callcenter', {templateUrl: 'views/CallCenter.html',   controller:['$scope',  'DataManager', fjs.ui.CallCenterController]}).
        when('/callcenter/allqueues', {templateUrl: 'views/CallCenter.html',   controller:['$scope',  'DataManager', fjs.ui.CallCenterController]}).
        when('/callcenter/mystatus', {templateUrl: 'views/CallCenter.html',   controller:['$scope',  'DataManager', fjs.ui.CallCenterController]}).
        when('/calllog', {templateUrl: 'views/CallsRecordings.html',   controller:['$scope',  'DataManager', fjs.ui.CallsRecordingsController]}).
        when('/calllog/voicemails', {templateUrl: 'views/VoiceRecordings.html',   controller:['$scope',  'DataManager', fjs.ui.CallsRecordingsController]}).
        when('/conferences', {templateUrl: 'views/MyConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/conferences/my', {templateUrl: 'views/MyConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/conferences/all', {templateUrl: 'views/AllConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/conference/:conferenceId', {templateUrl: 'views/ConferenceWidget.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/test', {templateUrl: 'views/TestWidget.html', controller: ['$scope', fjs.ui.TestWidget]}).
        when('/contact/:contactId', {templateUrl: 'views/ConversationWidget.html', controller: ['$scope', '$routeParams', '$timeout', '$filter', 'DataManager', fjs.ui.ConversationWidgetController]}).
        when('/zoom', {templateUrl: 'views/ZoomWidgetController.html',   controller:['$scope', 'DataManager', fjs.ui.ZoomWidgetController]}).
        when('/search', {templateUrl: 'views/SearchWidget.html',   controller:['$scope', 'DataManager', fjs.ui.SearchWidgetController]}).
        otherwise({redirectTo: '/contacts'});
  });

hud_web.controller("LaunchController", ['$rootScope', '$scope', 'DataManager', fjs.ui.LaunchController]);
hud_web.controller("MainController", ['$rootScope', '$scope', 'DataManager', fjs.ui.MainController]);
hud_web.controller("TopBarMeStatusController", ['$scope', 'DataManager', fjs.ui.TopBarMeStatusController]);
//hud_web.controller("MeWidgetController", fjs.ui.MeWidgetController);
hud_web.controller("LocationsController", ['$scope', '$element', 'DataManager', fjs.ui.LocationsController]);
hud_web.controller("SortMenuController", ['$scope', '$element', fjs.ui.SortMenuController]);
hud_web.controller("ActionMenuController", ['$scope', '$element', fjs.ui.ActionMenuController]);
//hud_web.controller("LeftBarController", fjs.ui.LeftBarController);
hud_web.controller("LeftBarController", ['$scope', '$filter', 'DataManager', fjs.ui.LeftBarController]);
hud_web.controller("LeftBarContactsController", ['$scope', 'DataManager', fjs.ui.LeftBarContactsController]);
hud_web.controller("LeftBarCallsController", ['$scope', 'DataManager', fjs.ui.LeftBarCallsController]);
//hud_web.controller("GroupsController", fjs.ui.GroupsController);
hud_web.controller("MyCallController", ['$scope', '$timeout', '$filter', 'DataManager', fjs.ui.MyCallController]);
hud_web.controller("EditContactDialog", ['$scope', '$filter', fjs.ui.EditContactDialog]);
hud_web.controller("TopNavigationController", ['$scope', 'DataManager', fjs.ui.TopNavigationController]);
hud_web.controller("SearchInputController", ['$scope', '$element', 'DataManager',  fjs.ui.SearchInputController]);
hud_web.controller("ResentsListController", ['$scope', '$rootScope', 'DataManager',  fjs.ui.ResentsListController]);
hud_web.controller("ResentItemController", ['$scope', '$element',  fjs.ui.ResentItemController]);
hud_web.controller("ContextMenuController", ['$scope', 'DataManager',  fjs.ui.ContextMenuController]);
hud_web.controller("ChatStatusController", ['$scope', 'DataManager',  fjs.ui.ChatStatusController]);

// chat panel controllers:
hud_web.controller("ConversationWidgetController", ['$scope', '$routeParams', '$timeout', '$filter', 'DataManager', fjs.ui.ConversationWidgetController]);
hud_web.controller("ConversationWidgetChatController", ['$scope', 'DataManager',  fjs.ui.ConversationWidgetChatController]);
hud_web.controller("ConferencesWidgetController", ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]);
hud_web.controller("CallCenterController", ['$scope', 'DataManager', fjs.ui.CallCenterController]);

//hud_web.controller("CallsRecordingsController", ['$scope', 'DataManager',  fjs.ui.CallsRecordingsController]);

//hud_web.controller("FavoriteContactsController", fjs.ui.FavoriteContactsController);
//hud_web.controller("ContactController", fjs.ui.ContactController);

