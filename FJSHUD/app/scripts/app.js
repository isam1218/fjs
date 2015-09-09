'use strict';

var hudweb = angular.module('fjshudApp', [
    'ngRoute',
    'ngSanitize',
    'flow'
]);

hudweb.config(function ($routeProvider, $compileProvider, $httpProvider) {
	// disables debugger injection 
	$compileProvider.debugInfoEnabled(false);
	
	// combines responses into one digest cycle
	$httpProvider.useApplyAsync(true);
	
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
		.otherwise({
			redirectTo: '/settings'
		});
})
.run(function ($http, $templateCache, $rootScope, $location) {
	// cache native alert template
	$http.get('views/nativealerts/CallAlert.html', { cache: $templateCache });
	
    $rootScope.$on("$locationChangeStart", function(e) {
        // don't redirect to self
		if ($location.path().indexOf($rootScope.myPid) != -1)
			e.preventDefault();
    });
});
