'use strict';

var hudweb = angular.module('fjshudApp', [
    'ngRoute',
    'ngSanitize',
    'flow',
    'angulartics',
    'angulartics.google.analytics'
]);

hudweb.config(function ($routeProvider, $compileProvider, $httpProvider,$analyticsProvider) {
	// disables debugger injection 
	$compileProvider.debugInfoEnabled(false);
	
	//enable route provider for google analytics
	$analyticsProvider.virtualPageviews(true);

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
.run(function ($http, $templateCache, $rootScope, $location, $routeParams, StorageService, SettingsService, GroupService, $timeout) {
	// cache native alert template
	$http.get('views/nativealerts/Alert.html', { cache: $templateCache });
	$http.get('views/nativealerts/CallAlert.html', { cache: $templateCache });
	$http.get('views/popups/NotificationsOverlay.html', { cache: $templateCache });
	$http.get('views/popups/NetworkErrorsOverlay.html', { cache: $templateCache });
	
    $rootScope.$on("$locationChangeStart", function(e, next, current) {
    	  
       // don't redirect to self
      if ($location.path().indexOf($rootScope.myPid) != -1){
        e.preventDefault();
        return;
      }

      var finalSelected, typeFlag, tmpSelected, tmpToggleObject, endPath, finalContactId, finalGroupId, finalQueueId, finalConfId;

      // function to figure out respective ids for contact, group, queue, conference...
      var parseSelectedTab = function(type){
        var typeId = $location.path().split(type)[1];
        switch(type){
          case '/contact/':
            finalContactId = typeId.split('/')[0];
            break;
          case '/group/':
            finalGroupId = typeId.split('/')[0];
            break;
          case '/queue/':
            finalQueueId = typeId.split('/')[0];
            break;
          case '/conference/':
            finalConfId = typeId.split('/')[0];
            break;
        }
        finalSelected = typeId.split('/')[1];
      };

      // set flag for type and run function to figure out ids
      if ($location.path().indexOf('/contact/') != -1){
        typeFlag = 'contact';
        parseSelectedTab('/contact/');
      } else if ($location.path().indexOf('/group/') != -1){
        typeFlag = 'group';
        parseSelectedTab('/group/');
      } else if ($location.path().indexOf('/queue/') != -1){
        typeFlag = 'queue';
        parseSelectedTab('/queue/');
      } else if ($location.path().indexOf('/conference/') != -1){
        typeFlag = 'conference';
        parseSelectedTab('/conference/');
      } else if ($location.path().indexOf('/callcenter') != -1){
        typeFlag = 'callcenter';
        finalSelected = $location.path().split('/callcenter/')[1];
      } else if ($location.path().indexOf('/calllog') != -1){
        typeFlag = 'calllog';
        finalSelected = $location.path().split('/calllog/')[1];
      }

      // this logic is for when the route (finalSelected tab) is not defined --> use saved LS tab, or default to applicable tab (groups have diff permissions thus diff access to various tabs)...
      // (otherwise will default to respective controller logic, which will have $routeParams)...
      if (!finalSelected && typeFlag){
        switch(typeFlag){
          case 'contact':
            tmpSelected = localStorage['ConversationWidget_' + finalContactId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConversationWidget_' + finalContactId + '_tabs_of_' + $rootScope.myPid]) : 'chat';
            endPath = '/contact/' + finalContactId + '/' + tmpSelected;
            break;
          case 'group':
            tmpSelected = localStorage['GroupSingle_' + finalGroupId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + finalGroupId + '_tabs_of_' + $rootScope.myPid]) : GroupService.isMine(finalGroupId) ? 'chat' : 'members';
            endPath = '/group/' + finalGroupId + '/' + tmpSelected;
            break;
          case 'queue':
            tmpSelected = localStorage['QueueWidget_' + finalQueueId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['QueueWidget_' + finalQueueId + '_tabs_of_' + $rootScope.myPid]) : 'agents';
            endPath = '/queue/' + finalQueueId + '/' + tmpSelected;
            break;
          case 'conference':
            tmpSelected = localStorage['ConferenceSingle_' + finalConfId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConferenceSingle_' + finalConfId + '_tabs_of_' + $rootScope.myPid]) : 'currentcall';
            endPath = '/conference/' + finalConfId + '/' + tmpSelected;
            break;
          case 'callcenter':
            tmpSelected = localStorage['CallCenter_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallCenter_tabs_of_' + $rootScope.myPid]) : 'myqueue';
            endPath = '/callcenter/' + tmpSelected;
            break;
          case 'calllog':
            tmpSelected = localStorage['CallsRecordings_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $rootScope.myPid]) : 'calllog';
            endPath = '/calllog/' + tmpSelected;
            break;
        }
        e.preventDefault();        
        $location.path(endPath);
      }

	  });

});






