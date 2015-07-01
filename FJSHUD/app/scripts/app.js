'use strict';

var hudweb = angular.module('fjshudApp', [
    'ngRoute',
    'ngSanitize',
    'flow'
]);

hudweb.config(function ($routeProvider) {
	$routeProvider
		.when('/settings',
		{
			templateUrl: 'views/MeWidgetController.html',
			controller: 'MeWidgetController'
		})
		 .when('/settings/callid/:callId',
      	{
        	templateUrl:'views/MeWidgetController.html',
        	controller: 'MeWidgetController'
      	})
		.when('/callcenter/:route?',
		{
			templateUrl: 'views/queues/CallCenter.html',
			controller: 'CallCenterController'
		})
		.when('/queue/:queueId/:route?', 
		{
			templateUrl: 'views/queues/QueueWidget.html',
			controller: 'QueueWidgetController',
			resolve: {
				resolve: function (QueueService) {
					return QueueService.getQueues();
				}
			}
		})
		.when('/calllog/:route?', 
		{
			templateUrl: 'views/CallsRecordings.html',
			controller: 'CallsRecordingsController'
		})
		.when('/conferences', 
		{
			templateUrl: 'views/conference/AllConferenceRooms.html',
			controller: 'ConferencesWidgetController'
		})
		.when('/conference/:conferenceId/:route?', 
		{
			templateUrl: 'views/conference/ConferenceWidget.html',
			controller: 'ConferenceSingleController',
			resolve: {
				resolve: function (ConferenceService) {
					return ConferenceService.getConferences();
				}
			}
		})     
		.when('/contact/:contactId/:route?', 
		{
			templateUrl: 'views/conversation/ConversationWidget.html',
			controller: 'ConversationWidgetController',
			resolve: {
				resolve: function (ContactService) {
					return ContactService.getContacts();
				}
			}
		})
		.when('/group/:groupId/:route?',
		{
			templateUrl: 'views/group/GroupSingleWidget.html',
			controller: 'GroupSingleController',
			resolve: {
				resolve: function (GroupService) {
					return GroupService.getGroups();
				}
			}
		})     
		.when('/zoom',
		{
			templateUrl: 'views/ZoomWidget.html',
			controller: 'ZoomWidgetController'
		})
		.when('/search', 
		{
			templateUrl: 'views/SearchWidget.html',
			controller: 'SearchWidgetController'
		})
		.when('/box',
		{
			templateUrl: 'views/BoxWidget.html'
		})
		.when('/intellinote',
		{
			templateUrl: 'views/Intellinote.html',
			controller: 'IntellinoteController'
		})
		.when('/zipwhip',
		{
			templateUrl: 'views/Zipwhip.html',
			controller: 'ZipwhipController'
		})
		.otherwise({
			redirectTo: '/settings'
		});
});
