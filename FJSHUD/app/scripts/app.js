'use strict';

/**
 * @ngdoc overview
 * @name fjshudApp
 * @description
 * # fjshudApp
 *
 * Main module of the application.
 */
var hudweb = angular.module('fjshudApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'HUD_model',
    'HUD_Dir',
    'flow',
    'react',
	'luegg.directives'
]);

hudweb.config(function ($routeProvider) {
    $routeProvider
        .when('/settings', {
			templateUrl: 'views/MeWidgetController.html',
			controller:['$scope','$http','HttpService', fjs.ui.MeWidgetController]
		})
        .when('/settings/weblauncer', {
			templateUrl: 'views/SettingsWebLauncer.html',
			controller:['$scope', fjs.ui.MeWidgetController]
		})
        .when('/settings/account', {
			templateUrl: 'views/SettingsAccount.html',
			controller:['$scope', fjs.ui.MeWidgetController]
		})
        .when('/callcenter', {
			templateUrl: 'views/CallCenter.html',
			controller:['$scope',  'DataManager', fjs.ui.CallCenterController]
		})
        .when('/callcenter/allqueues', {
			templateUrl: 'views/CallCenter.html',
			controller:['$scope',  'DataManager', fjs.ui.CallCenterController]
		})
        .when('/callcenter/mystatus', {
			templateUrl: 'views/CallCenter.html',
			controller:['$scope',  'DataManager', fjs.ui.CallCenterController]
		})
        .when('/queue/:queueId', {
			templateUrl: 'views/queues/QueueWidget.html',
			controller: ['$scope', '$routeParams', '$timeout', '$filter', 'DataManager', fjs.ui.QueueWidgetController]
		})
        .when('/calllog', {
			templateUrl: 'views/CallsRecordings.html',
			controller:['$scope',  'DataManager', fjs.ui.CallsRecordingsController]
		})
        .when('/calllog/voicemails', {
			templateUrl: 'views/VoiceRecordings.html',
			controller:['$scope',  'DataManager', fjs.ui.CallsRecordingsController]
		})
        .when('/conferences', {
			templateUrl: 'views/MyConferencesWidgetController.html',
			controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]
		})
        .when('/conferences/my', {
			templateUrl: 'views/MyConferencesWidgetController.html',
			controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]
		})
        .when('/conferences/all', {
			templateUrl: 'views/AllConferencesWidgetController.html',
			controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]
		})
        .when('/conference/:conferenceId', {
			templateUrl: 'views/ConferenceWidget.html',
			controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]
		})
        .when('/test', {
			templateUrl: 'views/TestWidget.html',
			controller: ['$scope', fjs.ui.TestWidget]
		})
        .when('/contacts', {
			templateUrl: 'views/ContactsWidget.html',
			controller: ['$scope', '$location', fjs.ui.ContactsWidget]
		})
        .when('/contact/:contactId', {
			templateUrl: 'views/ConversationWidget.html',
			controller: ['$scope', '$routeParams', 'ContactService', fjs.ui.ConversationWidgetController]
		})
        .when('/group/:groupId', {
			templateUrl: 'views/GroupSingleWidget.html',
			controller: ['$scope', fjs.ui.TestWidget]
		})
        .when('/zoom', {
			templateUrl: 'views/ZoomWidgetController.html',
			controller:['$scope', 'DataManager', fjs.ui.ZoomWidgetController]
		})
        .when('/search', {
			templateUrl: 'views/SearchWidget.html',
			controller:['$scope', 'DataManager', fjs.ui.SearchWidgetController]
		})
        .otherwise({redirectTo: '/settings'});
});

//hudweb.value("notification",fjs.hud.react.NotificationList);
hudweb.value("Voicemailbox",fjs.hud.react.VoiceMailbox);


hudweb.service('HttpService',['$http','$rootScope','$location','$q',fjs.hud.httpService]);
hudweb.service('GroupService',['$rootScope',fjs.hud.groupService]);
hudweb.service('ContactService',['$q', '$rootScope', 'HttpService',fjs.hud.contactService]);
hudweb.factory('VoicemailService',['$q','$rootScope',fjs.hud.VoicemailService]);
hudweb.service('UtilService',[UtilService]);

hudweb.controller("LaunchController", ['$rootScope', '$scope', 'DataManager', fjs.ui.LaunchController]);
hudweb.controller("MainController", ['$rootScope', '$scope', 'DataManager', 'HttpService', fjs.ui.MainController]);
hudweb.controller("ContactsWidget", ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', fjs.ui.ContactsWidget]);
hudweb.controller("GroupsController", ['$scope', '$rootScope', 'HttpService', 'GroupService', fjs.ui.GroupsController]);
hudweb.controller("TopBarMeStatusController", ['$scope', 'DataManager', 'HttpService', fjs.ui.TopBarMeStatusController]);
//hudweb.controller("MeWidgetController", fjs.ui.MeWidgetController);
hudweb.controller("LocationsController", ['$scope', '$element', 'DataManager', fjs.ui.LocationsController]);
hudweb.controller("SortMenuController", ['$scope', '$element', fjs.ui.SortMenuController]);
hudweb.controller("ActionMenuController", ['$scope', '$element', fjs.ui.ActionMenuController]);
//hudweb.controller("LeftBarController", fjs.ui.LeftBarController);
hudweb.controller("LeftBarController", ['$scope', 'HttpService', fjs.ui.LeftBarController]);
hudweb.controller("LeftBarContactsController", ['$scope', 'DataManager', fjs.ui.LeftBarContactsController]);
hudweb.controller("LeftBarCallsController", ['$scope', 'DataManager', fjs.ui.LeftBarCallsController]);
//hudweb.controller("GroupsController", fjs.ui.GroupsController);
hudweb.controller("MyCallController", ['$scope', '$timeout', '$filter', 'DataManager', fjs.ui.MyCallController]);
hudweb.controller("EditContactDialog", ['$scope', '$filter', fjs.ui.EditContactDialog]);
hudweb.controller("TopNavigationController", ['$scope', 'DataManager', fjs.ui.TopNavigationController]);
hudweb.controller("SearchInputController", ['$scope', '$element', 'DataManager',  fjs.ui.SearchInputController]);
hudweb.controller("ResentsListController", ['$scope', '$rootScope', 'DataManager',  fjs.ui.ResentsListController]);
hudweb.controller("ResentItemController", ['$scope', '$element',  fjs.ui.ResentItemController]);
hudweb.controller("ContextMenuController", ['$scope', 'DataManager',  fjs.ui.ContextMenuController]);
hudweb.controller("ChatStatusController", ['$scope', 'DataManager',  fjs.ui.ChatStatusController]);

// chat panel controllers:
hudweb.controller("ConversationWidgetController", ['$scope', '$routeParams', 'ContactService', fjs.ui.ConversationWidgetController]);
hudweb.controller("ConversationWidgetChatController", ['$scope', '$interval', 'ContactService', 'HttpService',  fjs.ui.ConversationWidgetChatController]);
hudweb.controller("ConferencesWidgetController", ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]);
hudweb.controller("CallCenterController", ['$scope', 'DataManager', fjs.ui.CallCenterController]);

// Controllers registered for subpanels of conversation widget
hudweb.controller("ConversationWidgetVoicemailsController",['$scope','$routeParams','$timeout','$filter', 'ContactService','VoicemailService','HttpService', fjs.ui.ConversationWidgetVoicemailsController ]);
hudweb.controller("ConversationWidgetGroupsController",['$scope','$routeParams','$rootScope','HttpService','GroupService','UtilService', fjs.ui.ConversationWidgetGroupsController ]);


// Call Center and Queues
hudweb.controller("QueueWidgetController", ['$scope', '$routeParams', '$timeout', '$filter', 'DataManager', fjs.ui.QueueWidgetController]);
hudweb.controller("QueueWidgetStatsController", ['$scope', '$routeParams', '$timeout', '$filter', 'DataManager', fjs.ui.QueueWidgetStatsController]);

hudweb.controller("MeWidgetController",['$scope','$http','HttpService',fjs.ui.MeWidgetController]);
hudweb.controller("NotificationController",['$scope','HttpService','$location',fjs.ui.NotificationController]);

//hudweb.controller("CallsRecordingsController", ['$scope', 'DataManager',  fjs.ui.CallsRecordingsController]);

//hudweb.controller("FavoriteContactsController", fjs.ui.FavoriteContactsController);
//hudweb.controller("ContactController", fjs.ui.ContactController);
