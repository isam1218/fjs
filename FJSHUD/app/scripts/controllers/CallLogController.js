hudweb.controller('CallLogController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'GroupService', 'ConferenceService', 'PhoneService', 'SettingsService',
	function($scope, $rootScope, $routeParams, httpService, contactService, queueService, groupService, conferenceService, phoneService, settingsService) {	
	$scope.calllog = this;
	$scope.calllog.query = '';
	$scope.calls = [];
	$scope.sortField = "startedAt";
	$scope.sortReverse = true;
	$scope.loading = true;
	
	var pageFilter;
	
	// limit results on other widgets
	if ($routeParams.queueId)
		pageFilter = $routeParams.queueId;
	else if ($routeParams.contactId)
		pageFilter = $routeParams.contactId;
	
	if (!$rootScope.isFirstSync)
		httpService.getFeed('calllog');
	
	$scope.$on('calllog_synced', function(event, data) {
		var count = 0;
		var logSize = settingsService.getSetting('recent_call_history_length') || 100; 
		
		// sort by date first
		$scope.calls = data.sort(function(a, b){
			return b.startedAt - a.startedAt;
		});
		
		// trim down to call log size + page filter
		$scope.calls = $scope.calls.filter(function(item) {
			if (count < logSize && item.xef001type != "delete" && !item.filterId && (!pageFilter || ((item.queueId !== undefined && pageFilter == item.queueId) || (item.contactId !== undefined && pageFilter == item.contactId)))) {
				
				// if an incoming + non-missed call, create property and set to true (adding this property in order to help 3-way sort under 'type')...
				if (item.incoming === true && item.missed === false)
					item['incomingNotMissed'] = true;
				else
					item['incomingNotMissed'] = false;

				// create outgoing property
				if (item.incoming == false)
					item['outgoing'] = true;
				else
					item['outgoing'] = false;
				
				if (item.missed == true)
					item.callType = 'phoneMissed';
				else if (item.incoming == true)
					item.callType = 'incoming';
				else
					item.callType = 'outgoing';
				
				// add contextual menu info
				if (item.queueId !== undefined)
					item.fullProfile = queueService.getQueue(item.queueId);
				else if (item.departmentId !== undefined)
					item.fullProfile = groupService.getGroup(item.departmentId);
				else if (item.conferenceId !== undefined)
					item.fullProfile = conferenceService.getConference(item.conferenceId);
				else if (item.contactId !== undefined)
					item.fullProfile = contactService.getContact(item.contactId);
			
				count++;
				return true;
			}
		});
			
		$scope.loading = false;
	});
	
	$scope.customFilter = function() {
		var query = $scope.calllog.query.toLowerCase();
		
		return function(call) {
			if (query == '' || call.displayName.toLowerCase().indexOf(query) != -1 || call.phone.indexOf(query) != -1)
				return true;
		};
	};	

    $scope.sort = function(field) {
      if($scope.sortField!=field) {
          $scope.sortField = field;
          $scope.sortReverse = false;
      }
      else {
          $scope.sortReverse = !$scope.sortReverse;
      }
    };
	
	$scope.makeCall = function(number) {
		phoneService.makeCall(number);
	};

}]);