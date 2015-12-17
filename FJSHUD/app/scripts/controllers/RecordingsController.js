hudweb.controller('RecordingsController', ['$scope', '$rootScope', '$routeParams', '$location', 'HttpService', 'ContactService', 'ConferenceService', 'QueueService', 'PhoneService', function($scope, $rootScope, $routeParams, $location, httpService, contactService, conferenceService, queueService, phoneService) {
	$scope.rec = this;
	$scope.rec.query = '';
	$scope.recordings = [];
	
	httpService.getFeed('callrecording');

	$scope.$on('callrecording_synced', function(event, data) {
		$scope.recordings = [];
		
		for (var i = 0, iLen = data.length; i < iLen; i++) {
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
			// groups
			else if ($routeParams.groupId && $scope.group) {
				for (var m = 0, mLen = $scope.group.members.length; m < mLen; m++) {
					var member = $scope.group.members[m];
					
					// member was involved somehow
					if (member.contactId == data[i].callerUserId || member.contactId == data[i].calleeUserId) {
						if (data[i].queueId)
							data[i].fullProfile = queueService.getQueue(data[i].queueId);
						else if (data[i].conferenceId)
							data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
						else if (member.contactId == data[i].callerUserId)
							data[i].fullProfile = contactService.getContact(member.contactId);
						else if (member.contactId == data[i].calleeUserId)
							data[i].fullProfile = contactService.getContact(data[i].callerUserId);
						
						$scope.recordings.push(data[i]);
						break;
					}
				}
			}
			// contacts
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
			else if (data[i].callerUserId == $rootScope.myPid || data[i].calleeUserId == $rootScope.myPid) {
				// get full profile
				if (data[i].conferenceId)
					data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
				else if (data[i].queueId)
					data[i].fullProfile = queueService.getQueue(data[i].queueId);
				else if (data[i].calleeUserId != $rootScope.myPid)
					data[i].fullProfile = contactService.getContact(data[i].calleeUserId);
				else
					data[i].fullProfile = contactService.getContact(data[i].callerUserId);
				
				$scope.recordings.push(data[i]);
			}
		}
	});

	$scope.customFilter = function() {
		var query = $scope.rec.query.toLowerCase();
		
		return function(rec) {
			if (query == '' || (rec.fullProfile && ((rec.fullProfile.displayName && rec.fullProfile.displayName.toLowerCase().indexOf(query) != -1) || (rec.fullProfile.name && rec.fullProfile.name.toLowerCase().indexOf(query) != -1))) || (rec.callerPhone.indexOf($scope.rec.query) != -1) || (rec.calleePhone.indexOf($scope.rec.query) != -1))
				return true;
		};
	};
	
	/* action items: */
	
	$scope.getLabel = function(rec) {
		// use "to" or "from" depending on incoming/callee status
		if (rec.queueId || ((rec.incoming && rec.calleeUserId == $rootScope.myPid) || (!rec.incoming && rec.callerUserId == $rootScope.myPid))) {
			return $scope.verbage.to;
		}
		
		return $scope.verbage.from;
	};
	
	$scope.playRecording = function(recording) {
		$rootScope.$broadcast('play_voicemail', recording);
	};
	
	$scope.callNumber = function(e, number) {
		e.stopPropagation();
		phoneService.makeCall(number);
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