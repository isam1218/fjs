hudweb.controller('CallStatusOverlayController', ['$scope', '$filter', '$timeout', '$location', 'ConferenceService', 'HttpService', function($scope, $filter, $timeout, $location, conferenceService, httpService) {
	$scope.onCall = $scope.$parent.overlay.data;
	$scope.timeElapsed = 0;
	$scope.screen = 'call';
	$scope.confQuery = '';
	$scope.tranQuery = '';
	$scope.selectedConf = null;
	$scope.addError = null;

	var updateTime = function() {
		if ($scope.onCall.call && $scope.onCall.call.startedAt) {
			// format date
			var date = new Date().getTime();
			$scope.timeElapsed = $filter('date')(date - $scope.onCall.call.startedAt, 'mm:ss');
		
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
	
	$scope.changeScreen = function(screen) {
		$scope.screen = screen;
		
		if (screen == 'conference') {
			$scope.conferences = conferenceService.getConferences();
			$scope.confQuery = '';
			$scope.addError = null;
			$scope.selectedConf = null;
			$scope.meToo = 0;
		}
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
					console.error(conference.members[i]);
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
		
    });
}]);
