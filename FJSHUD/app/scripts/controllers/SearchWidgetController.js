hudweb.controller('SearchWidgetController', ['$scope', '$rootScope', '$timeout', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService', 'StorageService', function($scope, $rootScope, $timeout, contactService, groupService, conferenceService, queueService, httpService, storageService) {
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
				if (groups[i].name.toLowerCase().indexOf(query) != -1 || groups[i].description.toLowerCase().indexOf(query) != -1 || groups[i].extension.indexOf(query) != -1){
					$scope.groups.push(groups[i]);
				}
			}

			for (var j = 0, jLen = $scope.groups.length; j < jLen; j++){
				var individualGrp = $scope.groups[j];
				for (var k = 0, kLen = individualGrp.members.length; k < kLen; k++){
					var individualMember = individualGrp.members[k];
					if (individualMember.fullProfile.hud_status == "available"){
						$scope.groups[j].hud_status = "available";
						break;
					}
					else
						$scope.groups[j].hud_status = "offline";
				}
			}

		});

		
		// search queues by name
		queueService.getQueues().then(function(data) {		
			var queues = data.queues;
			
			for (var i = 0, len = queues.length; i < len; i++) {
				if (queues[i].name.toLowerCase().indexOf(query) != -1){
					$scope.queues.push(queues[i]);
				}
			}
			for (var j = 0; j < $scope.queues.length; j++){
				if($scope.queues[j].loggedInMembers > 0)
					$scope.queues[j].loggedIn = "available";
				else
					$scope.queues[j].loggedIn = "offline";
			}
		});
		
		// search conferences by name
		conferenceService.getConferences().then(function(data) {
			var conferences = data.conferences;
			
			for (var i = 0, len = conferences.length; i < len; i++) {
				if (conferences[i].name.toLowerCase().indexOf(query) != -1)
					$scope.conferences.push(conferences[i]);
				else if (conferences[i].members){
					// if there's a member in the conference room --> want to also return any conference rooms that a searched-for user may be in
					var singleConf = conferences[i];
					for (var j = 0, jLen = singleConf.members.length; j < jLen; j++){
						if (singleConf.members[j].displayName.toLowerCase().indexOf(query) != -1 || singleConf.members[j].fullProfile.primaryExtension.indexOf(query) != -1)
							$scope.conferences.push(singleConf);
					}
				}
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
	
	$scope.getOwner = function(group) {
		if (group.ownerId == $rootScope.myPid)
			return 'owner: me';
		else {
			var contact = contactService.getContact(group.ownerId);
			return (contact ? 'owner: ' + contact.displayName : '');
		}
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
