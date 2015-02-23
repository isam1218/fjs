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
	
		contactService.getContacts().then(function(data) {
			for (key in data) {
				if (data[key].displayName.toLowerCase().indexOf(query) != -1)
					$scope.contacts.push(data[key]);
			}
		});
		
		groupService.getGroups().then(function(data) {
			for (key in data) {
				if (data[key].name.toLowerCase().indexOf(query) != -1 || data[key].description.toLowerCase().indexOf(query) != -1)
					$scope.groups.push(data[key]);
			}
		});
		
		queueService.getQueues().then(function(data) {
			for (key in data) {
				if (data[key].name.toLowerCase().indexOf(query) != -1)
					$scope.queues.push(data[key]);
			}
		});
		
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