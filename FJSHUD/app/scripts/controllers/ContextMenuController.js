hudweb.controller('ContextMenuController', ['$rootScope', '$scope', 'ContactService', 'GroupService', 'QueueService', 'SettingsService', 'HttpService', function($rootScope, $scope, contactService, groupService, queueService, settingsService, httpService) {
	$scope.xpid;
	$scope.type;
	$scope.name;
	$scope.canDock = true;
	
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, data) {
		$scope.group = null;
		$scope.contact = null;
		$scope.queue = [];
		$scope.xpid = data.xpid;
		
		// get type
		if (data.firstName !== undefined) {
			$scope.type = 'Contact';
			$scope.contact = data;
			$scope.name = data.displayName;
			$scope.isFavorite = groupService.isFavorite(data.xpid);
		}
		else if (data.loggedInMembers !== undefined) {
			$scope.type = 'QueueStat';
			$scope.name = data.name;
			
			angular.forEach(queueService.getMyQueues().queues, function(obj) {
				// user is in this queue
				if (obj.xpid == $scope.xpid) {					
					for (i = 0; i < obj.members.length; i++) {
						// find user's member ID
						if (obj.members[i].contactId == $rootScope.myPid) {
							$scope.queue.push(obj.members[i].xpid);
						
							// user is logged in but not permanently
							if (obj.members[i].status.status.indexOf('permanent') != -1)
								$scope.queue = [];
							else if (obj.members[i].status.status.indexOf('login') != -1)
								$scope.queue.push(true);
						}
					}
				}
			});
		}
		else if (data.roomNumber !== undefined) {
			$scope.type = 'ConferenceRoom';
			$scope.name = data.name;
		}
		else {
			$scope.type = 'Group';
			$scope.group = data;
			$scope.name = data.name;
			$scope.isMine = groupService.isMine(data.xpid);
		}
		
		// check if in dock
		settingsService.getSettings().then(function(data) {
			$scope.canDock = true;
			
			for (key in data) {
				if (key.indexOf('GadgetConfig') != -1 && key.indexOf($scope.xpid) != -1) {
					$scope.canDock = false;
					break;
				}
			}
		
			$scope.$safeApply();
		});
	});
	
	/**
		DOCK ICON ACTIONS
	*/
	
	$scope.dockItem = function(add) {
		if (add) {
			var data = {
				name: 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.xpid,
				value: JSON.stringify({
					"contextId": "empty",
					"factoryId": "Gadget" + $scope.type,
					"entityId": $scope.xpid,
					"config": {"x": 0, "y": 0},
					"index": 1
				})
			};
			
			httpService.sendAction('settings', 'update', data);
		}
		else {
			httpService.sendAction('settings', 'delete', {name: 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.xpid});
		}
	};
	
	$scope.editContact = function() {
		$scope.showOverlay(true, 'ContactEditOverlay', $scope.contact);
	};
	
	$scope.editGroup = function() {
		$scope.showOverlay(true, 'GroupEditOverlay', $scope.group);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.contact.xpid});
	};
	
	$scope.makeCall = function(number) {
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};
	
	$scope.sendGroupMail = function() {
		var emails = [];
		
		angular.forEach($scope.group.members, function(obj) {
			var contact = contactService.getContact(obj.contactId);
			
			if (contact.email)
				emails.push(contact.email);
		});
		
		window.open('mailto:' + emails.join(';'));
	};
	
	$scope.fileShare = function() {
		$scope.$parent.showOverlay(true, 'FileShareOverlay', {
			name: $scope.name,
			audience: $scope.type.split(/(?=[A-Z])/)[0].toLowerCase(),
			xpid: $scope.xpid
		});
	};
	
	$scope.loginQueue = function(login) {
		if (login)
			httpService.sendAction('queue_members', 'agentLogin', {memberId: $scope.queue[0]});
		else
			httpService.sendAction('queue_members', 'agentLogout', {memberId: $scope.queue[0], reason: '0_71485'});
	};
	
	$scope.resetQueue = function() {
		var doIt = confirm('Are you sure you want to reset statistics for queue ' + $scope.name + '?');
		
		if (doIt)
			httpService.sendAction('queues', 'resetStatistics', {queueId: $scope.xpid});
	};
}]);