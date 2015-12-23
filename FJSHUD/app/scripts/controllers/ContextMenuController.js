hudweb.controller('ContextMenuController', ['$rootScope', '$scope', '$timeout', '$location', 'ContactService', 'GroupService', 'QueueService', 'ConferenceService', 'SettingsService', 'HttpService', 'StorageService', 'PhoneService','$http','$modal',
	function($rootScope, $scope, $timeout, $location, contactService, groupService, queueService, conferenceService, settingsService, httpService, storageService, phoneService,$http,$modal) {
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
				
				// replace contact with member object
				if ($scope.widget == 'conversation' && member.contactId == $scope.context.xpid)
					$scope.context = member;
				
				if (member.contactId == $rootScope.myPid) {
					$scope.myQueue = true;
					
					if ($scope.widget != 'conversation')
						$scope.context = member;
				}
			}
		}
		else if ($scope.profile.roomNumber !== undefined) {
			$scope.type = 'ConferenceRoom';
		}
		else if ($scope.profile.name !== undefined && $scope.profile.name != '') {
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
				case 'QueueStat':
					if ($scope.context)
						$scope.canLoginAgent = settingsService.isEnabled($scope.context.fullProfile.permissions, 9);
					
					break;
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
					"index": $rootScope.dockIndex
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

	$scope.callLaterEnabled = function(){
		var settingIsEnabled = settingsService.getSetting('busy_ring_back');
		if (settingIsEnabled == "true")
			settingIsEnabled = true;
		else
			settingIsEnabled = false;
		return (settingIsEnabled && $scope.profile.call != null);
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
 $scope.addedContacts = [];
	$scope.screenShare = function(contact){

		        $scope.addedContacts.push(contact);
		        console.log("ADDED CONTACTS",contact);


		        
		  

		
        var data = {};
        var users = "";

         if(contact.length > 1){
		       	$scope.addedContacts = contact;
		       	for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
            users = users + $scope.addedContacts[i].contactId + ",";
            
        }
		       }
		       else{

        for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
            users = users + $scope.addedContacts[i].xpid + ",";
        }
    }
console.log("Contact",contact);
		console.log("USERS", users);

        data["topic"]="";
        data["users"]= users;
        data["option_start_type"]= 'screen_share';
        $http({
            method:'POST',
            url:fjs.CONFIG.SERVER.serverURL + "/v1/zoom",
           data: $.param(data),
           headers:{
                'Authorization': 'auth=' + localStorage.authTicket,//'auth=7aa21bf443b5c6c7b5d6e28a23ca5479061f36f5181b7677',
                'node':localStorage.nodeID,//'afdp37_1',
                'Content-Type':'application/x-www-form-urlencoded',
            }
        }).then(function(response){
            var data = response;
            $scope.startUrl = response.data.start_url;
            $scope.joinUrl = response.data.join_url;
            window.open($scope.startUrl, '_blank');
            $scope.inMeeting = true;
            $scope.addedContacts = [];
            $scope.$safeApply();

        });
        /*dataManager.sendFDPRequest("/v1/zoom", data, function(xhr, data, isOk) {
               context.onAjaxResult(isOk, data)
        });*/
    };
   
   
   
   	settingsService.getMe().then(function(data) {
   		var DATA = data;
   		if(data.email !== undefined){
   			console.log("MY EMAIL", data.email);
   			$scope.noEmail = false;
   		}
   		if(data.email === undefined | data.email == ""){
   			console.log("MY EMAIL", data.email);
   			$scope.noEmail = true;
   		}
   	});

  
   
    $scope.checkEmail = function(){

    		$scope.noEmail = true;
    		$modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'emailCheck.html',
      controller: 'emailCheckController',
      size: 'lg',
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        },
        update: function(){
          return $scope.updateBtn;
        },
        shared: function(){
          return $scope.meeting_id;
        },
        host: function(){
          return $scope.host_id;
        },
        topic: function(){
          return $scope.topic;
        },
        time: function(){
          return $scope.start_time;
        },
        timezone:function(){
          return $scope.timezone;
        },
        password:function(){
          return $scope.password;
        },
        option:function(){
          return $scope.option; 
        },
        start_hour: function(){
          return $scope.start_hour;
        },
        AmPm: function(){
          return $scope.AmPm;
        },
        hourDuration: function(){
          return $scope.hourDuration;
        },
        minDuration: function(){
          return $scope.minDuration;
        }
      }
    });

    	
    };


     settingsService.getPermissions().then(function(data) {
       $scope.getVideo = data.showVideoCollab;
       if($scope.getVideo == false){
        $scope.hideScreenShare = true;
        
       }
       else{
        $scope.hideScreenShare = false;
       }
      });
   

	$scope.loginQueue = function() {
		httpService.sendAction('queue_members', 'agentLogin', {
			memberId: $scope.context ? $scope.context.xpid : $scope.original.xpid
		});
	};
	
	$scope.logoutQueue = function(reason) {
		httpService.sendAction('queue_members', 'agentLogout', {
			memberId: $scope.context ? $scope.context.xpid : $scope.original.xpid, 
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