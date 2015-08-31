hudweb.controller('ContextMenuController', ['$rootScope', '$scope', '$timeout', '$location', 'ContactService', 'GroupService', 'QueueService', 'ConferenceService', 'SettingsService', 'HttpService', 'StorageService', 'PhoneService',
	function($rootScope, $scope, $timeout, $location, contactService, groupService, queueService, conferenceService, settingsService, httpService, storageService, phoneService) {
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
	
	// permissions (will most likely need to be moved)
	settingsService.getPermissions().then(function(data) {
		$scope.canRecord = data.recordingEnabled;
	});
	
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, res) {
		$scope.profile = res.obj.fullProfile ? res.obj.fullProfile : res.obj;		
		$scope.profile.name = $('<div/>').html($scope.profile.name).text();
		$scope.profile.displayName = $('<div/>').html($scope.profile.displayName).text();

		$scope.original = res.obj;
		$scope.context = res.context;
		$scope.widget = res.widget;
		
		$scope.reasons.show = false;
		$scope.myQueue = false;
		
		// get type
		if ($scope.original.parkExt !== undefined) {
			$scope.type = 'Contact';
			
			// external parked call
			if (!$scope.original.callerContactId)
				$scope.profile = null;
		}
		else if ($scope.profile.firstName !== undefined) {
			$scope.type = 'Contact';
			$scope.isFavorite = groupService.isFavorite($scope.profile.xpid);
		}
		else if ($scope.profile.loggedInMembers !== undefined) {
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
		else if ($scope.profile.roomNumber !== undefined) {
			$scope.type = 'ConferenceRoom';
		}
		else if ($scope.profile.name !== undefined) {
			$scope.type = 'Group';
			$scope.isMine = groupService.isMine($scope.profile.xpid);
		}
		else {
			$scope.type = null;
			$scope.profile = null;
		}
		
		// permissions
		if ($scope.profile.permissions !== undefined) {
			switch ($scope.type) {
				case 'Contact':
					$scope.canIntercom = settingsService.isEnabled($scope.profile.permissions, 6);
					$scope.canLoginAgent = settingsService.isEnabled($scope.profile.permissions, 9);
					
					if ($scope.profile.call)
						$scope.canBarge = settingsService.isEnabled($scope.profile.call.details.permissions, 1);
					
					break;
				case 'Group':
					$scope.canGroupIntercom = settingsService.isEnabled($scope.profile.permissions, 1);
					$scope.canGroupPage = settingsService.isEnabled($scope.profile.permissions, 2);
					$scope.canGroupVoicemail = settingsService.isEnabled($scope.profile.permissions, 3);
					
					break;
			}
		}
		
		// check if in dock
		if ($scope.profile) {
			settingsService.getSettings().then(function(data) {
				$scope.canDock = true;
				var regex = new RegExp($scope.profile.xpid + '$', 'g'); // end of string
				
				for (var key in data) {
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
		$scope.showOverlay(true, 'GroupEditOverlay', $scope.profile);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.profile.xpid});
	};
	
	$scope.deleteRecording = function() {
		var type;
		
		if ($scope.widget == 'recordings') {
			httpService.sendAction('callrecording', 'remove', {id: $scope.original.xpid});
			type = $scope.original.xpid;
		}
		else {
			httpService.sendAction('voicemailbox', 'delete', {id: $scope.original.xpid});
			type = $scope.original.voicemailMessageKey;
		}
		
		// close player?		
		if (document.getElementById('voicemail_player_source').src.indexOf(type) != -1) {
			$timeout(function() {
				$('.TopBarVoicemailControls .XButtonClose').trigger('click');
			}, 100);
		}
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
		//httpService.sendAction('me', 'callTo', {phoneNumber: number});
		phoneService.makeCall(number);
		storageService.saveRecentByPhone(number);
	};
	
	$scope.takeParkedCall = function(){
		httpService.sendAction('parkedcalls', 'transferFromPark', {
			parkedCallId: $scope.original.xpid,
			contactId: $rootScope.myPid
		});
	};
	
	$scope.takeQueueCall = function() {
		httpService.sendAction('queue_call', 'transferToMe', {
			queueCallId: $scope.context.xpid
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
		else{
			httpService.sendAction('contacts', action, {toContactId: $scope.profile.xpid});
			storageService.saveRecent('contact', $scope.profile.xpid);
		}
	};
	
	$scope.bargeCall = function(action) {
		httpService.sendAction('contacts', action + 'Call', {contactId: $scope.profile.xpid});
	};
	
	$scope.sendGroupMail = function(group) {
		var emails = [];
		
		// get all addresses from members
		for (var i = 0, iLen = group.members.length; i < iLen; i++) {
			var member = group.members[i];
			
			if (member.contactId != $rootScope.myPid && member.fullProfile && member.fullProfile.email)
				emails.push(member.fullProfile.email);
		}
		
		window.open('mailto:' + emails.join(';'));
	};
	
	$scope.fileShare = function(repost) {
		if (repost) {
			// need to find information for original audience
			var context = $scope.original.context.split(':');
			var audience = context[0].replace(/s$/g, '');
			var xpid = context[1];
			var name = '';
			
			// what a ridiculous way to get the name...
			switch(audience) {
				case 'contact':
					name = contactService.getContact(xpid).displayName;
					break;
				case 'conference':
					name = conferenceService.getConference(xpid).name;
					break;
				case 'queue':
					name = queueService.getQueue(xpid).name;
					break;
				case 'group':
					name = groupService.getGroup(xpid).name;
					break;
			}
			
			var data = {
				name: name,
				audience: audience,
				xpid: xpid,
				original: $scope.original
			};
		}
		else {
			var data = {
				name: $scope.profile.displayName || $scope.profile.name,
				audience: $scope.type.split(/(?=[A-Z])/)[0].toLowerCase(),
				xpid: $scope.profile.xpid
			};
		}
		
		$scope.$parent.showOverlay(true, 'FileShareOverlay', data);
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
	
	$scope.recordQueueCall = function(record) {		
		httpService.sendAction("queue_call", record ? "startRecord" : "stopRecord", {queueCallId: $scope.context.xpid});
	};
	
	$scope.muteUser = function(mute) {
		httpService.sendAction('conferences', mute ? 'muteMember' : 'unmuteMember', {
			memberId: $scope.original.xpid
		});
	};
}]);