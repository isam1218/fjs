hudweb.controller('RecordingsController', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'ConferenceService', function($scope, $rootScope, httpService, contactService, conferenceService) {
	$scope.rec = this;
	$scope.rec.query = '';
	$scope.recordings = [];
	
	httpService.getFeed('callrecording');
	$scope.$on('callrecording_synced', function(event, data) {
		$scope.recordings = [];
		
		for (i = 0; i < data.length; i++) {
			if (data[i].originatorUserId && data[i].originatorUserId == $rootScope.myPid) {
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
	
	$scope.playRecording = function(recording) {
		$rootScope.$broadcast('play_voicemail', recording);
	};
}]);