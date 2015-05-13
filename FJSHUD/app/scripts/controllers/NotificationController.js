hudweb.controller('NotificationController', ['$scope', '$rootScope', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService','ConferenceService', 
	function($scope, $rootScope, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService,conferenceService){

	var addedPid;
	var localPid;
	$scope.notifications = [];
	$scope.calls = {};
	$scope.inCall = false;
	$scope.inRinging = false;
	$scope.path = $location.absUrl().split("#")[0];
	$scope.messageLimit = 300;
	$scope.showNotificationBody = true;
	$scope.showHeader = false;	
	$scope.hasMessages = false;
	$scope.phoneSessionEnabled = false;
	$scope.pluginDownloadUrl = fjs.CONFIG.PLUGINS[$scope.platform];
	
	phoneService.getDevices().then(function(data){
		$scope.phoneSessionEnabled = true;
	});
	
	$scope.$on('pidAdded', function(event, data){
		addedPid = data.info;
		if (localStorage['recents_of_' + addedPid] === undefined){
			localStorage['recents_of_' + addedPid] = '{}';
		}
		$scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
	});
	
	myHttpService.getFeed('quickinbox');

	$scope.storeRecent = function(xpid){
		localPid = JSON.parse(localStorage.me);
		$scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
		// are all notifications sent from a contact? can they be sent via a group/queue/conf? if so, need to adjust the type...
		$scope.recent[xpid] = {
			type: 'contact',
			time: new Date().getTime()
		};
		localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
		$rootScope.$broadcast('recentAdded', {id: xpid, type: 'contact', time: new Date().getTime()});
	};

	$scope.getAvatar = function(pid){
		return myHttpService.get_avatar(pid,40,40);
	};

	$scope.getMessage = function(message){       				
		var messages = (message.message).split('\n');
		
		switch(message.type){

			case "vm":
				return "Voicemail from extension " + message.phone; 
				break;
			case "chat":
				return messages;
				break;
			default:
				return messages;

		
		}
	};

	$scope.remove_notification = function(xpid){
		for(i = 0; i < $scope.notifications.length; i++){
			if($scope.notifications[i].xpid == xpid){
				$scope.notifications.splice(i,1);
				break;
			}
		}
		for(i = 0; i < $scope.todaysNotifications.length; i++){
			if($scope.todaysNotifications[i].xpid == xpid){
				$scope.todaysNotifications.splice(i,1);
				break;
			}	
		}
		myHttpService.sendAction('quickinbox','remove',{'pid':xpid});
	};

	$scope.get_new_notifications= function(){
		new_notifications = $scope.notifications.filter(function(item){
			date = new Date(item.time);
			today = new Date();
			toReturn = false;
			if(date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
				if(date.getDate() == today.getDate()){
					if(item.receivedStatus != "away"){
						toReturn = true;
					}
				}
			}

			return toReturn; 
		});

		return new_notifications;
	};


	$scope.get_away_notifications= function(){
		away_notifications = $scope.notifications.filter(function(item){
			return item.receivedStatus == "away"; 
		});
		return away_notifications;
	};

	$scope.get_old_notifications= function(){
		old_notifications = $scope.notifications.filter(function(item){
			date = new Date(item.time);
			today = new Date();
			return date.getDate() != today.getDate() && item.receivedStatus != "away"; 
		});

		return old_notifications;
	};
	
	$scope.remove_all = function(){

		$scope.notifications = [];
		$scope.todaysNotifications = [];

		myHttpService.sendAction('quickinbox','removeAll');
			
		$scope.showOverlay(false);
	};

	$scope.go_to_notification_chat = function(message){
		if (message.context === undefined){
			var xpid = message.xpid;
		} else {
			var context = message.context;
			var xpid = context.split(':')[1];
		}
		$location.path("/" + message.audience + "/" + xpid + "/chat");
		$scope.remove_notification(message.xpid);
		$scope.showOverlay(false);
	};

	$scope.endCall = function(xpid){
		phoneService.hangUp(xpid);
	};

	$scope.holdCall = function(xpid,isHeld){
		phoneService.holdCall(xpid,isHeld);
		if(!isHeld){
			$scope.onHold = false;
		}
	};

	$scope.acceptCall = function(xpid){
		for(call in $scope.calls){
			if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
				$scope.holdCall($scope.calls[call].xpid);
			}
		}
		phoneService.acceptCall(xpid);
	};

	$scope.makeCall = function(phone){
		phoneService.makeCall(phone);
	};

	$scope.showNotificationOverlay = function(show) {
		if (!show)
			$scope.overlay = '';
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};


	$scope.$on('calls_updated',function(event,data){
		$scope.calls = {};
		var displayDesktopAlert = false;
		var toDisplayFor = settingsService.getSetting('alert_call_display_for');
		var alertDuration = settingsService.getSetting('alert_call_duration');
		if(data){

			for (i in data){
				$scope.calls[data[i].contactId] = data[i];
				

				switch(toDisplayFor){
					case 'never':
						break;
					case 'all':
						if(data[i].incoming){
							if(settingsService.getSetting('alert_call_incoming') == 'true'){
								displayDesktopAlert = true;
							}
						}else{
							if(settingsService.getSetting('alert_call_outgoing') == 'true'){
								displayDesktopAlert = true;
							}
						}
						break;
					case 'known':
						if(data[i].contactId){
							if(data[i].incoming){
								if(settingsService.getSetting('alert_call_incoming') == 'true'){
									displayDesktopAlert = true;
								}
							}else{
								if(settingsService.getSetting('alert_call_outgoing') == 'true'){
									displayDesktopAlert = true;
								}
							}	
						}else{
							displayDesktopAlert = false;
						}
						break;
						
				}

				

								
			}
			//}

			//entire state = 0
			//while_ringing


			me = $scope.meModel;
			$scope.currentCall = $scope.calls[Object.keys($scope.calls)[0]];
		}
		$scope.activeCall = {};
	
		if(alertDuration == 'while_ringing'){
			if($scope.currentCall){

				if($scope.currentCall.state != 0){
					$scope.activeCall.displayCall = false;
				}else{
					$scope.activeCall.displayCall = true;
				}
			}
		}else{
			$scope.displayCall = true;
		}
		$scope.inCall = Object.keys($scope.calls).length > 0;

		$scope.isRinging = true;
		element = document.getElementById("CallAlert");
       	
       	if(displayDesktopAlert){
			if(element != null){
       			element.style.display="block";
			}

			$scope.$safeApply();
		
			if(element != null){
				content = element.innerHTML;
				phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
				element.style.display="none";
			}	
		}
	});

	$scope.playVm = function(xpid){
		phoneService.playVm(xpid);
	};

	$scope.showCurrentCallControls = function(currentCall){
		$location.path("settings/callid/"+currentCall.xpid);
		phoneService.showCallControls(currentCall);
	};

	var displayNotification = function(){
		element = document.getElementById("CallAlert");
		if(element){
			element.style.display="block";
			content = element.innerHTML;
			phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
			element.style.display="none";
		  }
	};

	$scope.$on('phone_event',function(event,data){
		phoneEvent = data.event;
		$scope.inCall = true;
		switch (phoneEvent){
			case "ringing":
				$scope.isRinging = true;
				break;
			case "accepted":
				$scope.isRinging = false;
				break;
			case "onhold":
				$scope.onHold = true;
				break;
			case "resume":
				$scope.onHold = false;
				break;
			case "openNot":
				$scope.$parent.overlay ='notifications';
				break;

		}

		$scope.$safeApply();
	});

	$scope.$on('quickinbox_synced', function(event,data){
		var displayDesktopAlert = true;
		
  		if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});
			if($scope.notifications && $scope.notifications.length > 0){
				for(index in data){
					isNotificationAdded = false;
					var notification = data[index];
					notification.fullProfile = contactService.getContact(notification.senderId);
					notification.label == '';
							if(notification.type == 'q-alert-rotation'){
								notification.label = $scope.verbage.long_waiting_call;;
							}else if(notification.type == 'q-alert-abandoned'){
								notification.label = 'abandoned call';
							}else if(notification.type == 'gchat'){
								notification.label = "group chat to";
							}else if(notification.type == 'vm'){
								notification.label =$scope.verbage.voicemail;
							}else if(notification.type == 'wall' || notification.type == 'chat'){
								notification.label = 'chat message';
							}else if(notification.type == 'missed-call'){
                 notification.label = 'missed call';
							}else if(notification.type == 'busy-ring-back'){
                notification.label = 'is now available for call';
								notification.message= "User is free for call";
							}
					if(notification.audience == "conference"){
						var xpid = notification.context.split(':')[1];
						var conference = conferenceService.getConference(xpid);
						notification.conference = conference;
					}

					if(notification.xef001type != "delete"){
						for(i = 0; i < $scope.notifications.length;i++){
							if($scope.notifications[i].xpid == notification.xpid){
								$scope.notifications.splice(i,1,notification);
								isNotificationAdded = true;
								break;	
							}
						}
						if(!isNotificationAdded){
							

							$scope.notifications.push(notification);
						}
					}
				}
				$scope.notifications.sort(function(a, b){
					return b.time - a.time;
				});
			}else{
				for(index in data){
					var notification = data[index];
					notification.fullProfile = contactService.getContact(notification.senderId);
					notification.labelType == '';
					if(notification.type == 'q-alert-rotation'){
								notification.label = $scope.verbage.long_waiting_call;
					}else if(notification.type == 'q-alert-abandoned'){
								notification.label = 'abandoned call';
					}else if(notification.type == 'gchat'){
								notification.label = "group chat to";
					}else if(notification.type == 'vm'){
								notification.label = $scope.verbage.voicemail;
					}else if(notification.type == 'wall' || notification.type == 'chat'){
								notification.label = 'chat message';
					}else if(notification.type == 'missed-call'){
                notification.label = 'missed call';
					}else if(notification.type == 'busy-ring-back'){
            notification.label = 'is now available for call';
						notification.displayName = notification.fullProfile.displayName;
						notification.message= "User is free for call";
					}

					if(notification.audience == "conference"){
						var xpid = notification.context.split(':')[1];
						var conference = conferenceService.getConference(xpid);
						notification.conference = conference;
					}
					if(notification.xef001type != "delete"){
						$scope.notifications.push(notification);
						
					}
				}
			}
		};

		var playChatNotification = false;

		$scope.todaysNotifications = $scope.notifications.filter(function(item){
			currentDate = new Date();
			itemDate = new Date(item.time);
			var contactId = $routeParam.contactId;
			if(item.queueId){
				queue = queueService.getQueue(item.queueId);
				if(queue){
					item.displayName = queue.name;
				}
				
			}
			
			
			if(settingsService.getSetting('alert_vm_show_new') != 'true'){
				if(item.type == 'vm'){
					displayDesktopAlert = false;
				}	
			}

			if(currentDate.getFullYear() == itemDate.getFullYear() &&
			   currentDate.getMonth() == itemDate.getMonth() &&
			   currentDate.getDate() == itemDate.getDate()){			
					if(contactId && contactId != null && contactId == item.senderId && item.type == 'wall')
						return false;
					else{
						if(item.type == 'wall' || item.type == 'chat'){
							playChatNotification = true;
						}
						
						return true;
					}
			}
			return false;
		});


		if(playChatNotification){
			phoneService.playSound("received");
		} 

		$scope.todaysNotifications = $scope.todaysNotifications.sort(function(a,b){
			return b.time - a.time; 
		});
			       
		$scope.$watch(function(scope){
			if($scope.todaysNotifications && $scope.todaysNotifications.length > 3){
				$scope.showNotificationBody = false;
			}else{
				$scope.showNotificationBody = true;
			}
			if(!$scope.todaysNotifications || $scope.todaysNotifications.length == 0)
			  $scope.hasMessages = false;
			else
		   	  $scope.hasMessages = true;	  
		});		
			
		$scope.$safeApply();
		if(displayDesktopAlert){
			displayNotification();
		}				
    });		
}]);
