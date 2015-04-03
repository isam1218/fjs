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
			for (key in data) {
				if (data[key].displayName.toLowerCase().indexOf(query) != -1 || data[key].primaryExtension.indexOf(query) != -1)
					$scope.contacts.push(data[key]);
			}
		});
		
		// search groups by name or description or extension number
		groupService.getGroups().then(function(data) {
			for (key in data) {
				console.log('key - ', data[key]);
				if (data[key].name.toLowerCase().indexOf(query) != -1 || data[key].description.toLowerCase().indexOf(query) != -1 || data[key].extension.indexOf(query) != -1)
					$scope.groups.push(data[key]);
			}
		});
		
		// search queues by name
		queueService.getQueues().then(function(data) {
			for (key in data) {
				if (data[key].name.toLowerCase().indexOf(query) != -1)
					$scope.queues.push(data[key]);
			}
		});
		
		// search conferences by name
		angular.forEach(conferenceService.getConferences(), function(obj) {
			if (obj.name.toLowerCase().indexOf(query) != -1)
				$scope.conferences.push(obj);
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