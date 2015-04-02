hudweb.controller('NotificationController', ['$scope', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService', function($scope, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService){

	var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	$scope.notifications = [];
	$scope.calls = {};
	$scope.inCall = false;
	$scope.inRinging = false;
	$scope.path = $location.protocol() + "://" + $location.host() + ":" + $location.port();
	$scope.messageLimit = 3;
	myHttpService.getFeed('quickinbox');
	$scope.getAvatar = function(pid){
		return myHttpService.get_avatar(pid,40,40);
	}
	$scope.getMessage = function(message){

		switch(message.type){

			case "vm":
				return "Voicemail from extension " + message.phone; 
				break;
			case "chat":
				return message.message;
				break;
			default:
				return message.message;

		
		}
	}
	$scope.convertTime = function(time){
		var date = new Date(time);
		var currentDate = new Date();
		var Hour = date.getHours();
		var minutes = date.getMinutes();
		if(minutes < 10){
			minutes = "0" + minutes;
		}

		if(date.getDate() == currentDate.getDate() && date.getFullYear() == currentDate.getFullYear()){

			if(Hour > 12){
				return "today" +  " " + (Hour - 12).toString() + ":" + minutes + " pm" ;
			}else{
				return "today" +  " " + Hour.toString() + ":" + minutes + " am" ;
			}

		}else{
			if(Hour > 12){
				return weekday[date.getDay()] + " " + (Hour - 12).toString() + ":" + minutes + " pm";
		
			}else{
				return weekday[date.getDay()] + " " + (Hour).toString() + ":" + minutes + " am";
			}
		}
	}

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
	}
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
	}


	$scope.get_away_notifications= function(){
		away_notifications = $scope.notifications.filter(function(item){
			return item.receivedStatus == "away"; 
		});
		return away_notifications;
	}

	$scope.get_old_notifications= function(){
		old_notifications = $scope.notifications.filter(function(item){
			date = new Date(item.time);
			today = new Date();
			return date.getDate() != today.getDate() && item.receivedStatus != "away"; 
		});

		return old_notifications;
	}
	
	$scope.remove_all = function(){

		$scope.notifications = [];
		$scope.todaysNotifications = [];

		myHttpService.sendAction('quickinbox','removeAll');
			
	}

	$scope.go_to_notification_chat = function(xpid,messageXpid){
		$location.path("/contact/" + xpid);
		$scope.remove_notification(messageXpid);
		$scope.showOverlay(false);
	}


	$scope.endCall = function(xpid){
		phoneService.hangUp(xpid);
	}


	$scope.holdCall = function(xpid,isHeld){
		phoneService.holdCall(xpid,isHeld);
		if(!isHeld){
			$scope.onHold = false;
		}
	}
	$scope.acceptCall = function(xpid){
		phoneService.acceptCall(xpid);
	}
	$scope.makeCall = function(phone){
		phoneService.makeCall(phone);
	}

	$scope.showOverlay = function(show) {
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
			if($scope.currentCall.state != 0){
				$scope.activeCall.displayCall = false;
			}else{
				$scope.activeCall.displayCall = true;
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
	}

	$scope.showCurrentCallControls = function(currentCall){
		$location.path("settings/callid/"+currentCall.xpid);
		phoneService.showCallControls(currentCall);
	}

	var displayNotification = function(){
		element = document.getElementById("CallAlert");

		if(element){
			element.style.display="block";
			content = element.innerHTML;
			phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
			element.style.display="none";
		  }
	}

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
				$scope.$parent.overlay ='notifications'
				break;

		}

		$scope.$safeApply();
	});

	$scope.$on('quickinbox_synced', function(event,data){
		var displayDesktopAlert = true;
			
  		if(data){
			data.sort(function(a,b){
				// recent notifications up top; down to oldest at the bottom...
				return b.time - a.time;
			});
			if($scope.notifications && $scope.notifications.length > 0){
				for(notification in data){
					isNotificationAdded = false;
					if(data[notification].xef001type != "delete"){
						for(i = 0; i < $scope.notifications.length;i++){
							if($scope.notifications[i].xpid == data[notification].xpid){
								$scope.notifications.splice(i,1,data[notification]);
								isNotificationAdded = true;
								break;	
							}
						}
						if(!isNotificationAdded){
							$scope.notifications.push(data[notification]);
						}
					}
				}
			}else{
				for(notification in data){
					if(data[notification].xef001type != "delete"){
						$scope.notifications.push(data[notification]);
						
					}
				}
			}
		}

		var playChatNotification = false;

		$scope.todaysNotifications = $scope.notifications.filter(function(item){
			currentDate = new Date();
			itemDate = new Date(item.time);
			var contactId = $routeParam.contactId;
			
			if(item.queueId){
				queue = queueService.getQueue(item.queueId);
				item.displayName = queue.name;
				if(item.type == 'q-alert-rotation'){
					item.type = 'long waiting call';
				}else if(item.type == 'q-alert-abandoned'){
					item.type = 'abandoned call';
				}
			}
			
			if(item.type == 'wall'){
					item.type = 'chat message';
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
					else
						if(item.type == 'wall'){
							playChatNotification = true;
						}
						return true;
				
			}
			return false;
		});

		if(playChatNotification){
			phoneService.playSound("received");
		} 

		$scope.todaysNotifications = $scope.todaysNotifications.sort(function(a,b){
			// console.log('notifications order - ', $scope.todaysNotifications);
			return b.time - a.time; 
		});
		
		var notifyElement = document.getElementsByClassName("LeftBarNotifications");
		

		if($scope.todaysNotifications && $scope.todaysNotifications.length > 0){
			notifyElement[0].style["max-height"] = "400px";	
		}else{
			notifyElement[0].style["max-height"] = "1px";	
		}

		$scope.$safeApply();
		if(displayDesktopAlert){
			displayNotification();
		}
		
    });
}]);
