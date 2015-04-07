hudweb.controller('RecordingsController', ['$scope', '$rootScope', '$routeParams', '$location', 'HttpService', 'ContactService', 'ConferenceService', 'QueueService', function($scope, $rootScope, $routeParams, $location, httpService, contactService, conferenceService, queueService) {
	$scope.rec = this;
	$scope.rec.query = '';
	$scope.recordings = [];
	
	httpService.getFeed('callrecording');

	$scope.$on('callrecording_synced', function(event, data) {
		$scope.recordings = [];
		
		for (i = 0; i < data.length; i++) {
			// conferences
			if ($routeParams.conferenceId) {
				if (data[i].conferenceId == $routeParams.conferenceId) {
					data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
					
					$scope.recordings.push(data[i]);
				}
			}
			// queues
			else if ($routeParams.queueId) {
				if (data[i].queueId == $routeParams.queueId) {
					data[i].fullProfile = queueService.getQueue(data[i].queueId);
					
					$scope.recordings.push(data[i]);
				}
			}
			// contact
			else if ($routeParams.contactId) {
				var type = false;
				
				// to...
				if (data[i].callerUserId == $routeParams.contactId)
					type = 'calleeUserId';
				// from...
				else if (data[i].calleeUserId == $routeParams.contactId)
					type = 'callerUserId';
				
				if (type) {
					if (data[i].queueId)
						data[i].fullProfile = queueService.getQueue(data[i].queueId);
					else if (data[i].conferenceId)
						data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
					else
						data[i].fullProfile = contactService.getContact(data[i][type]);
					
					$scope.recordings.push(data[i]);
				}
			}
			// my recordings
			else if (data[i].originatorUserId && data[i].originatorUserId == $rootScope.myPid) {
				// get full profile
				if (data[i].conferenceId)
					data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
				else
					data[i].fullProfile = contactService.getContact(data[i].calleeUserId);
				
				$scope.recordings.push(data[i]);
			}
		}
	});
	
	$scope.customFilter = function() {
		var query = $scope.rec.query.toLowerCase();
		
		return function(rec) {
			if (query == '' || (rec.fullProfile.displayName && rec.fullProfile.displayName.toLowerCase().indexOf(query) != -1) || (rec.fullProfile.name && rec.fullProfile.name.toLowerCase().indexOf(query) != -1))
				return true;
		};
	};
	
	/* action items: */
	
	$scope.playRecording = function(recording) {
		$rootScope.$broadcast('play_voicemail', recording);
	};
	
	$scope.callNumber = function(e, number) {
		e.stopPropagation();
		
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};
	
	$scope.joinConference = function(e, xpid) {
		e.stopPropagation();
		
		var params = {
			conferenceId: xpid,
			contactId: $rootScope.myPid,
		};
		httpService.sendAction("conferences", "joinContact", params);
				
		$location.path('/conference/' + xpid + '/currentcall');
	};
}]);