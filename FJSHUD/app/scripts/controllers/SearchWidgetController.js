hudweb.controller('SearchWidgetController', ['$scope', '$timeout', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService', 'StorageService', function($scope, $timeout, contactService, groupService, conferenceService, queueService, httpService, storageService) {
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
			var groups = data.groups;
			
			for (var i = 0, len = groups.length; i < len; i++) {
				if (groups[i].name.toLowerCase().indexOf(query) != -1 || groups[i].description.toLowerCase().indexOf(query) != -1 || groups[i].extension.indexOf(query) != -1)
					$scope.groups.push(groups[i]);
			}
		});
		
		// search queues by name
		queueService.getQueues().then(function(data) {		
			var queues = data.queues;
			
			for (var i = 0, len = queues.length; i < len; i++) {
				if (queues[i].name.toLowerCase().indexOf(query) != -1)
					$scope.queues.push(queues[i]);
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
	
	// reset search field on clear
	$scope.$watch('query', function(val) {
		if (val == '') {
			$scope.$evalAsync(function() {
				$scope.contacts = [];
				$scope.groups = [];
				$scope.conferences = [];
				$scope.queues = [];
				$scope.searched = false;
			});
		}
	});

	// clicked on call button
    $scope.callExtension = function($event, contact){
		$event.stopPropagation();
		$event.preventDefault();
	  
	    httpService.sendAction('me', 'callTo', {phoneNumber: contact.primaryExtension});
	  
	    storageService.saveRecent('contact', contact.xpid);
    };

    $scope.$on("$destroy", function() {
		
    });
}]);
