hudweb.controller('RecordingsController', ['$scope', '$rootScope', '$routeParams', '$location', '$timeout', 'HttpService', 'ContactService', 'ConferenceService', 'QueueService', 'PhoneService', 'SettingsService', function($scope, $rootScope, $routeParams, $location, $timeout, httpService, contactService, conferenceService, queueService, phoneService, settingsService) {
	$scope.rec = {
		query: '',
		opened: null
	};
	$scope.loading = true;
	$scope.recordings = [];
	// display call back button under all recording use cases except queue recordings...
	$scope.hideQueueRecordingCallBackButton = false;
	
	var syncFilter;
	var target;
	
	settingsService.getSettings().then(function() {
		// find targetKey based on current widget
		if ($routeParams.conferenceId)
			target = 'conferences:' + $routeParams.conferenceId;
		else if ($routeParams.queueId){
			target = 'queues:' + $routeParams.queueId;
			// don't want to display call back button under queue recording tab
			$scope.hideQueueRecordingCallBackButton = true;
		}
		else if ($routeParams.groupId && $scope.group)
			target = 'groups:' + $routeParams.groupId;
		else if ($routeParams.contactId)
			target = 'contacts:' + $routeParams.contactId;
		else
			target = 'contacts:' + $rootScope.myPid;
		
		// start listening for recordings from sync
		httpService.sendAction('callrecording', 'setFilter', {
			targetKey: target
		})
		.success(function(data) {
			if (data && data.result) {
				syncFilter = data.result;
				
				// sometimes the front label is missing
				if (syncFilter.indexOf('callrecording') == -1)
					syncFilter = 'callrecording:' + syncFilter;
				
				setUpWatcher();
				
				// add to sync
				httpService.addFeedToSync(syncFilter);
			}
		})
		.finally(function() {
			// hide loading in case data set was empty
			$timeout(function() {
				if ($scope.loading) {
					$scope.loading = false;
					$scope.$digest();
				}
			}, 5000, false);
		});
	});
	
	var setUpWatcher = function() {
		$scope.$on(syncFilter + '_synced', function(event, data) {
			$scope.loading = false;
			$scope.recordings = [];
			
			// add recordings with profile data
			for (var i = 0, len = data.length; i < len; i++) {
				if (data[i].xef001type != 'delete') {
					// conferences
					if (data[i].conferenceId)
						data[i].fullProfile = conferenceService.getConference(data[i].conferenceId);
					// queues
					else if (data[i].queueId)
						data[i].fullProfile = queueService.getQueue(data[i].queueId);
					// groups
					else if ($routeParams.groupId && $scope.group) {
						for (var m = 0, mLen = $scope.group.members.length; m < mLen; m++) {
							var member = $scope.group.members[m];
							
							// member was involved somehow
							if (member.contactId == data[i].callerUserId || member.contactId == data[i].calleeUserId) {
								if (member.contactId == data[i].callerUserId)
									data[i].fullProfile = contactService.getContact(member.contactId);
								else if (member.contactId == data[i].calleeUserId)
									data[i].fullProfile = contactService.getContact(data[i].callerUserId);
								
								break;
							}
						}
					}
					// contacts
					else if ($routeParams.contactId) {
						if (data[i].callerUserId == $routeParams.contactId)
							data[i].fullProfile = contactService.getContact(data[i].calleeUserId);
						else if (data[i].calleeUserId == $routeParams.contactId)
							data[i].fullProfile = contactService.getContact(data[i].callerUserId);
					}
					// my recordings
					else {
						if (data[i].calleeUserId != $rootScope.myPid)
							data[i].fullProfile = contactService.getContact(data[i].calleeUserId);
						else
							data[i].fullProfile = contactService.getContact(data[i].callerUserId);
					}
					
					$scope.recordings.push(data[i]);
				}
			}
		});
	};

	$scope.customFilter = function() {
		var query = $scope.rec.query.toLowerCase();
		
		return function(rec) {
			if (query == '' || (rec.fullProfile && ((rec.fullProfile.displayName && rec.fullProfile.displayName.toLowerCase().indexOf(query) != -1) || (rec.fullProfile.name && rec.fullProfile.name.toLowerCase().indexOf(query) != -1))) || (rec.callerPhone.indexOf($scope.rec.query) != -1) || (rec.calleePhone.indexOf($scope.rec.query) != -1))
				return true;
		};
	};
	
	/* action items: */
	
	$scope.callNumber = function(rec) {
		ga('send', 'event', {eventCategory:'Calls', eventAction:'Place', eventLabel: "Calls/Recordings - Recordings - Call"});
		
		if (rec.conferenceId) {
			var params = {
				conferenceId: rec.conferenceId,
				contactId: $rootScope.myPid
			};
			
			httpService.sendAction("conferences", "joinContact", params);
					
			$location.path('/conference/' + rec.conferenceId + '/currentcall');
		}
		else
			phoneService.makeCall(rec.calleePhone);
	};
	
	$scope.deleteFile = function(rec) {
		httpService.sendAction('callrecording', 'remove', {id: rec.xpid});
	};
	
	$scope.downloadFile = function(rec) {
		var path = httpService.get_audio('media?key=callrecording:' + rec.xpid);
		document.getElementById('download_file').setAttribute('src', path);
	};
}]);