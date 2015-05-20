hudweb.controller('ContextMenuController', ['$rootScope', '$scope', '$location', 'ContactService', 'GroupService', 'QueueService', 'SettingsService', 'HttpService', function($rootScope, $scope, $location, contactService, groupService, queueService, settingsService, httpService) {
	// original object/member vs full profile
	$scope.original;
	$scope.profile;
	
	$scope.type;
	$scope.widget;
	$scope.context;
	
	$scope.myQueue;
	$scope.canDock = true;	
	$scope.reasons = {
		list: [],
		show: false,
	};
	
	queueService.getQueues().then(function(data) {
		$scope.reasons.list = data.reasons;
	});
	
	// permissions
	settingsService.getPermissions().then(function(data) {
		$scope.canLoginAgent = data.enableAgentLogin;
		$scope.canRecord = data.recordingEnabled;
	});
	
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, res) {
		$scope.profile = res.obj.fullProfile ? res.obj.fullProfile : res.obj;		
		$scope.original = res.obj;
		$scope.context = res.context;
		$scope.widget = res.widget;
		
		$scope.reasons.show = false;
		$scope.myQueue = false;
		
		// get type
		if ($scope.profile.firstName) {
			$scope.type = 'Contact';
			$scope.isFavorite = groupService.isFavorite($scope.profile.xpid);
		}
		else if ($scope.profile.loggedInMembers) {
			$scope.type = 'QueueStat';
			
			for (var i = 0, len = $scope.profile.members.length; i < len; i++) {
				var member = $scope.profile.members[i];
				
				// find user's member ID
				if ($scope.widget == 'conversation' && member.contactId == $scope.context.xpid)
					$scope.original = member;
				
				if (member.contactId == $rootScope.myPid) {
					$scope.myQueue = true;
					
					if ($scope.widget != 'conversation')
						$scope.original = member;
				}
			}
		}
		else if ($scope.profile.roomNumber) {
			$scope.type = 'ConferenceRoom';
		}
		else if ($scope.profile.parkExt) {
			$scope.type = 'ParkedCall';
			$scope.profile = contactService.getContact($scope.original.callerContactId);
		}
		else if ($scope.profile.name) {
			$scope.type = 'Group';
			$scope.isMine = groupService.isMine($scope.profile.xpid);
		}
		else {
			$scope.type = null;
			$scope.profile = null;
		}
		
		// check if in dock
		if ($scope.profile) {
			settingsService.getSettings().then(function(data) {
				$scope.canDock = true;
				var regex = new RegExp($scope.profile.xpid + '$', 'g'); // end of string
				
				for (key in data) {
					if (key.indexOf('GadgetConfig') != -1 && key.match(regex)) {
						$scope.canDock = false;
						break;
					}
				}
			});
		}
	});
	
	/**
		DOCK ICON ACTIONS
	*/
	
	$scope.dockItem = function(add) {
		if (add) {
			var data = {
				name: 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.profile.xpid,
				value: JSON.stringify({
					"contextId": "empty",
					"factoryId": "Gadget" + $scope.type,
					"entityId": $scope.profile.xpid,
					"config": {"x": 0, "y": 0},
					"index": 1
				})
			};
			
			httpService.sendAction('settings', 'update', data);
		}
		else {
			// send to dock controller
			$rootScope.$broadcast('delete_gadget', 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.profile.xpid);
		}
	};
	
	$scope.editContact = function() {
		$scope.showOverlay(true, 'ContactEditOverlay', $scope.profile);
	};
	
	$scope.editGroup = function() {
		$rootScope.groupEdit = true;
		$rootScope.groupInfoId = $scope.profile.xpid;
		$scope.showOverlay(true, 'GroupEditOverlay', $scope.profile);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.profile.xpid});
	};
	
	$scope.deleteRecording = function() {
		if ($scope.widget == 'recordings')
			httpService.sendAction('callrecording', 'remove', {id: $scope.original.xpid});
		else
			httpService.sendAction('voicemailbox', 'delete', {id: $scope.original.xpid});
	};
	
	$scope.markAsRead = function(read) {
		httpService.sendAction("voicemailbox", "setReadStatusAll", {
			read: read, 
			ids: $scope.original.xpid
		});
	};
	
	$scope.deleteAttachment = function() {
		httpService.sendAction("streamevent", "deleteEvent", {xpid: $scope.original.xpid});
	};
	
	$scope.callNumber = function(number) {
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};
	
	$scope.takeCall = function(){
		httpService.sendAction('parkedcalls', 'transferFromPark', {
			parkedCallId: $scope.original.xpid,
			contactId: $rootScope.myPid
		});
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
			httpService.sendAction('contacts', action, {toContactId: $scope.profile.xpid});
	};
	
	$scope.sendGroupMail = function(group) {
		var emails = [];
		
		// get all addresses from members
		for (var i = 0; i < group.members.length; i++) {
			var member = group.members[i];
			
			if (member.contactId != $rootScope.myPid && member.fullProfile && member.fullProfile.email)
				emails.push(member.fullProfile.email);
		}
		
		window.open('mailto:' + emails.join(';'));
	};
	
	$scope.fileShare = function() {
		$scope.$parent.showOverlay(true, 'FileShareOverlay', {
			name: $scope.profile.displayName || $scope.profile.name,
			audience: $scope.type.split(/(?=[A-Z])/)[0].toLowerCase(),
			xpid: $scope.profile.xpid
		});
	};

	$scope.loginQueue = function() {
		httpService.sendAction('queue_members', 'agentLogin', {memberId: $scope.original.xpid});
	};
	
	$scope.logoutQueue = function(reason) {
		httpService.sendAction('queue_members', 'agentLogout', {
			memberId: $scope.original.xpid, 
			reason: reason
		});
	};
	
	$scope.resetQueue = function() {
		var doIt = confirm('Are you sure you want to reset statistics for queue ' + $scope.profile.name + '?');
		
		if (doIt)
			httpService.sendAction('queues', 'resetStatistics', {queueId: $scope.profile.xpid});
	};
	
	$scope.joinConference = function(join) {
		var xpid = $scope.type == 'ConferenceRoom' ? $scope.profile.xpid : $scope.context.xpid;
		
		if (join) {
			var params = {
				conferenceId: xpid,
				contactId: $rootScope.myPid,
			};
			httpService.sendAction("conferences", "joinContact", params);
					
			$location.path('/conference/' + xpid + '/currentcall');
		}
		else
			httpService.sendAction("conferences", "leave", {conferenceId: xpid});
	};
	
	$scope.kickMember = function() {
		httpService.sendAction('conferencemembers', 'kickMember', {memberId: $scope.original.xpid});
	};
	
	$scope.recordConference = function(record) {		
		httpService.sendAction("conferences", record ? "startRecord" : "stopRecord", {conferenceId: $scope.profile.xpid});
	};
	
	$scope.muteUser = function(mute) {
		httpService.sendAction('conferences', mute ? 'muteMember' : 'unmuteMember', {
			memberId: $scope.original.xpid
		});
	};
}]);