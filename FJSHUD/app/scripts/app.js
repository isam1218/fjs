'use strict';

var hudweb = angular.module('fjshudApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'flow',
    'react'
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
      .when('/settings/weblauncer',
      {
        templateUrl: 'views/SettingsWebLauncer.html',
        controller: 'MeWidgetController'
	  })
      .when('/settings/account', 
      {
        templateUrl: 'views/SettingsAccount.html',
        controller: 'MeWidgetController'
      })
      .when('/callcenter',
      {
        templateUrl: 'views/queues/CallCenter.html',
        controller: 'CallCenterController'
		  })
      .when('/callcenter/myqueue',
      {
        templateUrl: 'views/queues/CallCenter.html',
        controller: 'CallCenterController'
      })
      .when('/callcenter/allqueues',
      {
        templateUrl: 'views/queues/CallCenter.html',
        controller: 'CallCenterController'
      })
      .when('/callcenter/mystatus',
      {
        templateUrl: 'views/queues/CallCenter.html',
        controller: 'CallCenterController'
      })
      .when('/queue/:queueId', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
	  })
      .when('/queue/:queueId/agents', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
      })
      .when('/queue/:queueId/stats', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
      })
      .when('/queue/:queueId/calls', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
      })
      .when('/queue/:queueId/calllog', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
      })
      .when('/queue/:queueId/recordings', 
      {
        templateUrl: 'views/queues/QueueWidget.html',
        controller: 'QueueWidgetController'
      })
      .when('/calllog', 
      {
        templateUrl: 'views/CallsRecordings.html',
        controller: 'CallsRecordingsController'
	  })
      .when('/calllog/calllog', 
      {
        templateUrl: 'views/CallsRecordings.html',
        controller: 'CallsRecordingsController'
      })
      .when('/calllog/voicemails',
      {
        templateUrl: 'views/CallsRecordings.html',
        controller: 'CallsRecordingsController'
      })
      .when('/calllog/recordings',
      {
        templateUrl: 'views/CallsRecordings.html',
        controller: 'CallsRecordingsController'
      })
      .when('/conferences', 
      {
        templateUrl: 'views/ConferenceRoomWidget.html',
        controller: 'ConferencesWidgetController'
	  })
      .when('/conference/:conferenceId', 
      {
        templateUrl: 'views/ConferenceWidget.html',
        controller: 'ConferenceSingleController'
	  })
      .when('/conference/:conferenceId/currentcall',
      {
        templateUrl: 'views/ConferenceWidget.html',
        controller: 'ConferenceSingleController'
      })
      .when('/conference/:conferenceId/chat',
      {
        templateUrl: 'views/ConferenceWidget.html',
        controller: 'ConferenceSingleController'
      })
      .when('/conference/:conferenceId/recordings',
      {
        templateUrl: 'views/ConferenceWidget.html',
        controller: 'ConferenceSingleController'
      })
      .when('/contact/:contactId', 
      {
        templateUrl: 'views/conversation/ConversationWidget.html',
        controller: 'ConversationWidgetController'
	  })
      .when('/contact/:contactId/:route',
      {
        templateUrl: 'views/conversation/ConversationWidget.html',
        controller: 'ConversationWidgetController'
      })
      .when('/group/:groupId',
      {
        templateUrl: 'views/group/GroupSingleWidget.html',
        controller: 'GroupSingleController'
		  })
      .when('/group/:groupId/chat',
      {
        templateUrl: 'views/group/GroupSingleWidget.html',
        controller: 'GroupSingleController'
      })
      .when('/group/:groupId/members',
      {
        templateUrl: 'views/group/GroupSingleWidget.html',
        controller: 'GroupSingleController'
      })
      .when('/group/:groupId/voicemails',
      {
        templateUrl: 'views/group/GroupSingleWidget.html',
        controller: 'GroupSingleController'
      })
      .when('/group/:groupId/page',
      {
        templateUrl: 'views/group/GroupSingleWidget.html',
        controller: 'GroupSingleController'
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
      .otherwise({
        redirectTo: '/settings'
      });
});
