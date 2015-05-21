hudweb.controller('SearchWidgetController', ['$scope', '$timeout', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($scope, $timeout, contactService, groupService, conferenceService, queueService) {
	$scope.searched = false;

	$scope.searchEmUp = function() {
		$scope.contacts = [];
		$scope.groups = [];
		$scope.conferences = [];
		$scope.queues = [];
		
		if ($scope.query == '') {
			$scope.searched = false;
			return;
		}
		
		$scope.searched = true;
		
		// case insensitive
		var query = $scope.query.toLowerCase();
	
		// search contacts by display name or primary extension
		contactService.getContacts().then(function(data) {
			for (var i = 0, len = data.length; i < len; i++) {
				if (data[i].displayName.toLowerCase().indexOf(query) != -1 || data[i].primaryExtension.indexOf(query) != -1)
					$scope.contacts.push(data[i]);
			}
		});
		
		// search groups by name or description or extension number
		groupService.getGroups().then(function(data) {
			for (var i = 0, len = data.length; i < len; i++) {
				if (data[i].name.toLowerCase().indexOf(query) != -1 || data[i].description.toLowerCase().indexOf(query) != -1 || data[i].extension.indexOf(query) != -1)
					$scope.groups.push(data[i]);
			}
		});
		
		// search queues by name
		queueService.getQueues().then(function(data) {			
			for (var i = 0, len = data.length; i < len; i++) {
				if (data[i].name.toLowerCase().indexOf(query) != -1)
					$scope.queues.push(data[i]);
			}
		});
		
		// search conferences by name
		conferenceService.getConferences().then(function(data) {
			var conferences = data.conferences;
			
			for (var i = 0, len = conferences.length; i < len; i++) {
				if (conferences[i].name.toLowerCase().indexOf(query) != -1)
					$scope.conferences.push(conferences[i]);
			}
		});
	};
	
	$scope.clearSearch = function() {
		$timeout(function() {
			if ($scope.query == '') {
				$scope.contacts = [];
				$scope.groups = [];
				$scope.conferences = [];
				$scope.queues = [];
				
				$scope.searched = false;
				$scope.$safeApply();
			}
		}, 100);
	};
	
	$scope.onKeyDown = function($event) {
		// enter
		if ($event.keyCode == 13)
			$scope.searchEmUp();
	};

    $scope.$on("$destroy", function() {
		
    });
}]);