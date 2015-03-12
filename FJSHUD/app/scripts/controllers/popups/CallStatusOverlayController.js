hudweb.controller('CallStatusOverlayController', ['$scope', '$filter', '$timeout', '$location', 'ConferenceService', 'ContactService', 'HttpService', function($scope, $filter, $timeout, $location, conferenceService, contactService, httpService) {
	$scope.onCall = $scope.$parent.overlay.data;
	$scope.timeElapsed = 0;
	$scope.recordingElapsed = 0;
	$scope.screen = 'call';
	
	$scope.confQuery = '';
	$scope.tranQuery = '';
	$scope.selectedConf = null;
	$scope.addError = null;
	$scope.contacts = [];

	var updateTime = function() {
		if ($scope.onCall.call && $scope.onCall.call.startedAt) {
			// format date
			var date = new Date().getTime();
			$scope.timeElapsed = $filter('date')(date - $scope.onCall.call.startedAt, 'mm:ss');
			
			// also get recorded time
			if ($scope.onCall.call.recorded)
				$scope.recordingElapsed = $filter('date')(date - localStorage.recordedAt, 'mm:ss');
		
			// increment
			if ($scope.$parent.overlay.show)
				$timeout(updateTime, 1000);
		}
		else
			$scope.showOverlay(false);
	};
	
	updateTime();
	
	$scope.getCallStatusAvatar = function(call) {
		if (call && call.contactId)
			return httpService.get_avatar(call.contactId, 28, 28);
		else
			return 'img/Generic-Avatar-28.png';
	};
	
	$scope.bargeCall = function(type, xpid) {
		httpService.sendAction('contacts', type + 'Call', {contactId: xpid});
	};
	
	$scope.recordCall = function() {
		var action = '';
		
		if (!$scope.onCall.call.recorded) {
			$scope.recordingElapsed = '00:00';
			localStorage.recordedAt = new Date().getTime();
			action = 'startCallRecording';
		}
		else
			action = 'stopCallRecording';
			
		httpService.sendAction('contacts', action, {contactId: $scope.onCall.xpid});
	};
	
	/**
		ALTERNATE POP-UP SCREENS
	*/
	
	$scope.changeScreen = function(screen, xpid) {
		$scope.screen = screen;
		$scope.addError = null;
		
		if (screen == 'conference') {
			$scope.conferences = conferenceService.getConferences();
			$scope.confQuery = '';
			$scope.selectedConf = null;
			$scope.meToo = 0;
		}
		else if (screen == 'transfer') {
			$scope.transferFrom = contactService.getContact(xpid);
			$scope.tranQuery = '';
			$scope.transferTo = null;
			$scope.sendToPrimary = 1;
			
			contactService.getContacts().then(function(data) { 
				$scope.contacts = data;
			});
		}
	};
	
	$scope.selectDestination = function(contact) {
		$scope.transferTo = contact;
	};
	
	$scope.transferCall = function() {
		if ($scope.transferTo) {
			httpService.sendAction('calls', $scope.sendToPrimary ? 'transferToContact' : 'transferToVoicemail', {
				fromContactId: $scope.transferFrom.xpid,
				toContactId: $scope.transferTo.xpid
			});
			
			$scope.showOverlay(false);
		}
		else
			$scope.addError = 'Select destination';
	};
	
	$scope.selectConference = function(conference) {
		$scope.selectedConf = conference;
	};
	
	$scope.customConfFilter = function() {
		var query = $scope.confQuery.toLowerCase();
		
		return function(conference) {
			// by conference name
			if ($scope.confQuery == '' || conference.extensionNumber.indexOf(query) != -1)
				return true;
			// by member name
			else if (conference.members) {
				for (i = 0; i < conference.members.length; i++) {
					if (conference.members[i].displayName.toLowerCase().indexOf(query) != -1)
						return true;
				}
			}
		};
	};
	
	$scope.joinConference = function() {
		if ($scope.selectedConf) {
			httpService.sendAction('conferences', 'joinCall', {
				conferenceId: $scope.selectedConf.xpid,
				contactId: $scope.onCall.xpid
			});
			
			// me, too?
			if ($scope.meToo) {
				httpService.sendAction('conferences', 'joinContact', {conferenceId: $scope.selectedConf.xpid});
			}
			
			// close and redirect
			$scope.showOverlay(false);
			$location.path('/conference/' + $scope.selectedConf.xpid);
		}
		else
			$scope.addError = 'Select conference room';
	};

    $scope.$on("$destroy", function() {
		updateTime = null;
    });
}]);
