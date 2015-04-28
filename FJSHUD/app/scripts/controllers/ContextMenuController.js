hudweb.controller('ContextMenuController', ['$rootScope', '$scope', '$location', 'ContactService', 'GroupService', 'QueueService', 'SettingsService', 'HttpService','PhoneService', function($rootScope, $scope, $location, contactService, groupService, queueService, settingsService, httpService,phoneService) {
	$scope.xpid;
	$scope.targetID;
	$scope.type;
	$scope.name;
	$scope.widget;
	$scope.reasons = {};
	$scope.canDock = true;
	
	$scope.enableCallLater = true;
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, res) {
		var data = res.obj.fullProfile ? res.obj.fullProfile : res.obj;
		
		$scope.widget = res.widget;		
		$scope.xpid = data.xpid;
		$scope.reasons = {
			list: [],
			show: false
		};
		
		// remember parent xpid to delete records
		if (res.widget == 'recordings')
			$scope.targetID = res.obj.xpid;
		
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
			$scope.queue = {};
			$scope.reasons.list = queueService.getReasons();
			
			angular.forEach(queueService.getMyQueues().queues, function(obj) {
				// user is in this queue
				if (obj.xpid == $scope.xpid) {					
					for (i = 0; i < obj.members.length; i++) {
						// find user's member ID
						if (obj.members[i].contactId == $rootScope.myPid) {
							$scope.queue.memberID = obj.members[i].xpid;
						
							// user is logged in but not permanently
							if (obj.members[i].status.status.indexOf('permanent') != -1)
								$scope.queue.status = 'permanent';
							else if (obj.members[i].status.status.indexOf('login') != -1)
								$scope.queue.status = 'login';
						}
					}
				}
			});
		}
		else if (data.roomNumber !== undefined) {
			$scope.type = 'ConferenceRoom';
			$scope.conference = data;
			$scope.name = data.name;
		}
		else if (data.parkExt !== undefined) {
			$scope.type = 'ParkedCall';
			$scope.contact = contactService.getContact(data.callerContactId);
			if ($scope.contact == null) {
				$scope.name = "private";
				$scope.canDock = false;
			}
			$scope.parkedCall = data; 
		}
		else if (data.name) {
			$scope.type = 'Group';
			$scope.group = data;
			$scope.name = data.name;
			$scope.isMine = groupService.isMine(data.xpid);
		}
		else {
			$scope.type = null;
			$scope.name = null;
			return;
		}
		
		// check if in dock
		settingsService.getSettings().then(function(data) {
			$scope.canDock = true;
			var regex = new RegExp($scope.xpid + '$', 'g'); // end of string
			
			for (key in data) {
				if (key.indexOf('GadgetConfig') != -1 && key.match(regex)) {
					$scope.canDock = false;
					break;
				}
				$scope.enableCallLater = data['busy_ring_back']  == 'true';
			}
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
			// send to dock controller
			$rootScope.$broadcast('delete_gadget', 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.xpid);
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
	
	$scope.deleteRecording = function() {
		httpService.sendAction('callrecording', 'remove', {id: $scope.targetID});
	};
	
	$scope.callNumber = function(number) {
		phoneService.makeCall(number);
	};

	$scope.callLater = function(){
		httpService.sendAction('contacts', 'callLater', {toContactId: $scope.contact.xpid});
		
	}
	
	$scope.takeCall = function(){
		httpService.sendAction('parkedcalls','transferFromPark',{parkedCallId:$scope.parkedCall.xpid,contactId:$scope.meModel.my_pid});
	};	

	// generic function for any internal calls (page, intercom, voicemail, etc.)
	$scope.callInternal = function(action, group) {
		// group
		if (group) {
			if (group.extension) {
				var params = {
					contactId: $rootScope.myPid,
					groupId: group.xpid
				};
				httpService.sendAction('groups', action, params);
			}
		}
		// single user
		else
			httpService.sendAction('contacts', action, {toContactId: $scope.xpid});
	};
	
	$scope.sendGroupMail = function(group) {
		var emails = [];
		
		// get all addresses from members
		angular.forEach(group.members, function(obj) {
			if (obj.contactId != $rootScope.myPid) {
				var contact = contactService.getContact(obj.contactId);
				
				if (contact.email)
					emails.push(contact.email);
			}
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

	$scope.loginQueue = function() {
		httpService.sendAction('queue_members', 'agentLogin', {memberId: $scope.queue.memberID});
	};
	
	$scope.logoutQueue = function(reason) {
		httpService.sendAction('queue_members', 'agentLogout', {
			memberId: $scope.queue.memberID, 
			reason: reason
		});
	};
	
	$scope.resetQueue = function() {
		var doIt = confirm('Are you sure you want to reset statistics for queue ' + $scope.name + '?');
		
		if (doIt)
			httpService.sendAction('queues', 'resetStatistics', {queueId: $scope.xpid});
	};
	
	$scope.joinConference = function(join) {
		if (join) {
			var params = {
				conferenceId: $scope.xpid,
				contactId: $rootScope.myPid,
			};
			httpService.sendAction("conferences", "joinContact", params);
					
			$location.path('/conference/' + $scope.xpid + '/currentcall');
		}
		else
			httpService.sendAction("conferences", "leave", {conferenceId: $scope.xpid});
	};
	
	$scope.recordConference = function(record) {		
		httpService.sendAction("conferences", record ? "startRecord" : "stopRecord", {conferenceId: $scope.xpid});
	};
}]);