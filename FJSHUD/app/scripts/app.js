'use strict';

var hudweb = angular.module('fjshudApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'flow',
    'luegg.directives',
    'infinite-scroll',
]);

hudweb.config(function ($routeProvider) {
    $routeProvider
        .when('/settings', {
			templateUrl: 'views/MeWidgetController.html',
			controller: 'MeWidgetController'
		})
        .when('/settings/weblauncer', {
			templateUrl: 'views/SettingsWebLauncer.html',
			controller: 'MeWidgetController'
		})
        .when('/settings/account', {
			templateUrl: 'views/SettingsAccount.html',
			controller: 'MeWidgetController'
		})
        .when('/callcenter', {
			templateUrl: 'views/queues/CallCenter.html',
			controller: 'CallCenterController'
		})
        .when('/queue/:queueId', {
			templateUrl: 'views/queues/QueueWidget.html',
			controller: 'QueueWidgetController'
		})
        .when('/calllog', {
			templateUrl: 'views/CallsRecordings.html',
			controller: 'CallsRecordingsController'
		})
        .when('/conferences', {
			templateUrl: 'views/ConferenceRoomWidget.html',
			controller: 'ConferencesWidgetController'
		})
        .when('/conference/:conferenceId', {
			templateUrl: 'views/ConferenceWidget.html',
			controller: 'ConferenceSingleController'
		})
        .when('/contact/:contactId', {
			templateUrl: 'views/conversation/ConversationWidget.html',
			controller: 'ConversationWidgetController'
		})
        .when('/group/:groupId', {
			templateUrl: 'views/group/GroupSingleWidget.html',
			controller: 'GroupSingleController'
		})
        .when('/group/:groupId/chat', {
			templateUrl: 'views/group/GroupSingleWidget.html',
			controller: 'GroupSingleController'
		})
        .when('/zoom', {
			templateUrl: 'views/ZoomWidgetController.html',
			controller: 'ZoomWidgetController'
		})
        .when('/search', {
			templateUrl: 'views/SearchWidget.html',
			controller: 'SearchWidgetController'
		})
		.when('/box',{
			templateUrl: 'views/BoxWidget.html'
		})
        .otherwise({redirectTo: '/settings'});
});
