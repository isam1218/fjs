hudweb.controller('NotificationController', ['$scope', '$rootScope','$interval', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService','ConferenceService','NotificationService','NtpService','$timeout', 
	function($scope, $rootScope,$interval, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService,conferenceService,nservice,ntpService,$timeout){

	var playChatNotification = false;
	var displayDesktopAlert = true;
		
	$scope.notifications = [];
	$scope.calls = {};
	phoneService.getMyCalls().then(function(data){
		$scope.calls = data.mycalls;
	});
	var long_waiting_calls = {};
	$scope.inCall = false;
	$scope.inRinging = false;
	$scope.path = $location.absUrl().split("#")[0];
	$scope.messageLimit = 300;
	$scope.showNotificationBody = true;
	$scope.showHeader = false;	
	$scope.hasMessages = false;
	$scope.phoneSessionEnabled = true;
	$scope.pluginDownloadUrl = fjs.CONFIG.PLUGINS[$scope.platform];
	$scope.showTimer = false;
	$scope.selectedStatsTab = false;
	$scope.selectedCallsTab = false;
	$scope.notifications_to_display = '';
	$scope.new_notifications_to_display = '';
	$scope.away_notifications_to_display = '';
	$scope.old_notifications_to_display = '';
	$scope.message_section_notifications = ''
	$scope.hasNewNotifications = false;
	$scope.hasAwayNotifications = false;
	$scope.hasOldNotifications = false;
	$scope.newNotificationsLength = 0;
	$scope.awayNotificationsLength = 0;
	$scope.oldNotificationsLength = 0;
	$scope.newNotifications = [];
	$scope.awayNotifications = [];
	$scope.oldNotifications = [];	
	$scope.todaysNotifications = [];
	$scope.numshowing = 0;
	$scope.totalTodaysNotifications = 0;
	$scope.showing = 4;
	$scope.showAllNotifications = false;
	$scope.showNew = false;
	$scope.showAway = false;
	$scope.showOld = false;
	$scope.displayAlert = false;
	$scope.stopTime;	
	$scope.callObj = {};
	$scope.anotherDevice = false;
	
	$scope.phoneSessionEnabled = phoneService.isPhoneActive();	
	
	$scope.showHideElements = function(index){
		var showing = $scope.todaysNotifications.length - 5;
		if(!$scope.phoneSessionEnabled || $scope.anotherDevice)
			showing = $scope.todaysNotifications.length - 4;
		if(!$scope.phoneSessionEnabled && $scope.anotherDevice)
			showing = $scope.todaysNotifications.length - 3;
		$scope.showing = showing;
		if (!$scope.showAllNotifications && $scope.todaysNotifications){
			if (index >= showing)
				return true;
			else
				return false;
		}
		return true;
	};

	$scope.showTodayHeader = function(index, anotherDevice){
		if ($scope.todaysNotifications.length <= 4){
			if (index == 0)
				return true
			else
				return false
		} else {
			if (!anotherDevice){
				if (index == $scope.todaysNotifications.length - 5)
					return true
				else
					return false;
			} else {
				if (index == $scope.todaysNotifications.length - 4)
					return true;
				else
					return false;
			}
		}
	};

	// used to update the UI
    $scope.updateTime = function(id) {    	
			
		var time = ntpService.calibrateTime(new Date().getTime()) - $scope.callObj[id].start;
    	time = time/1000;
    	$scope.callObj[id].seconds = Math.floor(time % 60);
    	time = time/60; 
    	$scope.callObj[id].minutes = Math.floor(time % 60);
    	time = time/60; 
    	$scope.callObj[id].hours = Math.floor(time % 24);  
    	$scope.callObj[id].days = Math.floor(time/24);
    	
    	var secondsText = '';
    	var minutesText = '';   
    	var hoursText = '';
    	var daysText = '';
    	   	
	  	//seconds
	  	if($scope.callObj[id].seconds < 10)
	  		secondsText = ':0'+$scope.callObj[id].seconds;
	  	else
	  		secondsText = ':'+$scope.callObj[id].seconds;
	  	//minutes
	  	if($scope.callObj[id].minutes < 10)
	  		minutesText = '0'+$scope.callObj[id].minutes;
	  	else
	  		minutesText = $scope.callObj[id].minutes;
	  	//hours
	  	if($scope.callObj[id].hours < 10)
	  		hoursText = '0'+$scope.callObj[id].hours+":";
	  	else
	  		hoursText = $scope.callObj[id].hours+":";
	  	
	  	if($scope.callObj[id].hours <= 0)
	  		hoursText='';
	  	
	  	if($scope.callObj[id].days <= 0)
	  		daysText = '';
	  	else
	  		daysText = $scope.callObj[id].days +" days ";
	  	
	  	$scope.callObj[id].secondsText = secondsText;
	  	$scope.callObj[id].minutesText = minutesText;  
	  	$scope.callObj[id].hoursText = hoursText;	  
	  	$scope.callObj[id].daysText = daysText;
    };       

	phoneService.getDevices().then(function(data){
		$scope.phoneSessionEnabled = true;
	});
	
	$scope.phoneSessionEnabled = phoneService.isPhoneActive();

	$scope.$on('pidAdded', function(event, data){
		addedPid = data.info;
		if (localStorage['recents_of_' + addedPid] === undefined){
			localStorage['recents_of_' + addedPid] = '{}';
		}
		$scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
	});
	
	myHttpService.getFeed('quickinbox');

	$scope.getAvatar = function(pid){
		return myHttpService.get_avatar(pid,40,40);
	};

	$scope.getMessage = function(message){       				
		var messages = message.message && message.message != null && message.message != "" ? (message.message).split('\n') : '';
		if(messages.length == 0 || (messages.length == 1 && messages[0] == ''))
			messages="";
		
		switch(message.type){

			case "vm":
				return "Voicemail from extension " + message.phone; 
				break;
			case 'missed-call':	
				return "Missed call from extension " + message.phone; 
				break;
			case "chat":
			case "gchat":	
				return messages;
				break;
			default:
				return messages;

		
		}
	};

	$scope.getNotificationsLength = function(length)
	{
		var length = $scope.phoneSessionEnabled ? length : length + 1;
		
		return length;
	};
	
	$scope.remove_notification = function(xpid){
		for(var i = 0; i < $scope.notifications.length; i++){
			if($scope.notifications[i].xpid == xpid){
				$scope.notifications.splice(i,1);
				break;
			}
		}

		for(var i = 0; i < $scope.todaysNotifications.length; i++){
			if($scope.todaysNotifications[i].xpid == xpid){
				$scope.todaysNotifications.splice(i,1);
				break;
			}	
		}
		myHttpService.sendAction('quickinbox','remove',{'pid':xpid});
	};

	$scope.showNotifications = function(flag)
	{
		
		switch(flag){
		  case 'new': if(!$scope.showNew)
			  			$scope.showNew = true;
		              else
		            	$scope.showNew = false;  
		              break;
		  case 'away': if(!$scope.showAway)
			  			$scope.showAway = true;
		               else
		            	$scope.showAway = false;
		               break;
		  case 'old':  if(!$scope.showOld)
			  			$scope.showOld = true;
		               else
		            	$scope.showOld = false;
		               break;
		}
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
        if(new_notifications.length > 0 )
        	$scope.hasNewNotifications = true;
        
        $scope.newNotificationsLength = new_notifications.length;    	
        $scope.newNotifications = new_notifications;
    	
		return new_notifications;
	};



	$scope.get_away_notifications= function(){
		away_notifications = $scope.notifications.filter(function(item){
			return item.receivedStatus == "away"; 
		});
		if(away_notifications.length > 0)
			$scope.hasAwayNotifications = true;
		
		$scope.awayNotificationsLength = away_notifications.length;
		$scope.awayNotifications = away_notifications;
    	
		return away_notifications;
	};

	$scope.get_old_notifications= function(){
		old_notifications = $scope.notifications.filter(function(item){
			date = new Date(item.time);
			today = new Date();
			return date.getTime() < today.getTime() && date.getDate() < today.getDate() && item.receivedStatus != "away"; 
		});
        if(old_notifications.length > 0)
           $scope.hasOldNotifications = true; 
        
    	$scope.oldNotificationsLength = old_notifications.length;
    	$scope.oldNotifications = old_notifications;
    	
		return old_notifications;
	};
	
	$scope.removeOldNotifications = function()
	{		
		  
		while($scope.oldNotifications.length > 0)
		{
			var nIndex_xpid = $scope.oldNotifications[0].xpid;				
		    myHttpService.sendAction('quickinbox','remove',{'pid': nIndex_xpid});
		    $scope.oldNotifications.splice(0,1);
		}	
		
		$scope.hasOldNotifications = false;	
		$scope.oldNotifications = [];					
											
		if(!$scope.hasNewNotifications && 
		   !$scope.hasAwayNotifications && 
		   !$scope.hasOldNotifications)
			$scope.showNotificationOverlay(false);				
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
		
		var tab = message.type == 'q-broadcast' ? '/alerts' : '/chat';
		switch(message.audience){
			case 'contacts':
				var contact = contactService.getContact(xpid);
				if(contact.primaryExtension == ''){
					tab = '/';
				}
				break;
		}


		$location.path("/" + message.audience + "/" + xpid + tab);
		$scope.remove_notification(message.xpid);
		$scope.showOverlay(false);
	};
	
	$scope.showQueue = function(message)
    {
		var qid = message.queueId;
		
		$('.Widget.Queues .WidgetTabBarButton').removeClass('fj-selected-item');
		
		if(message.type == 'q-alert-abandoned')		
		{
			queueService.setSelected(true, 'stats', qid);
			$location.path("/" + message.audience + "/" + qid + "/stats");							
		}
		else
		{
			if(message.type == 'q-alert-rotation')
			{	
			   queueService.setSelected(true, 'calls', qid);	
			   $location.path("/" + message.audience + "/" + qid + "/calls");
			   		  
			}   
			   
		}
		$scope.remove_notification(message.xpid);
		$scope.showNotificationOverlay(false);
    };	

	$scope.endCall = function(xpid){
		phoneService.hangUp(xpid);
	};

	$scope.holdCall = function(xpid,isHeld){
		phoneService.holdCall(xpid,isHeld);
		
		

		if(!isHeld){
			for(call in $scope.calls){
				if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
					$scope.holdCall($scope.calls[call].xpid,true);
				}
			}
			$scope.onHold = false;
		}
	};

	$scope.acceptCall = function(xpid){
		for(call in $scope.calls){
			if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
				$scope.holdCall($scope.calls[call].xpid,true);
			}
		}
		phoneService.acceptCall(xpid);
	};

	$scope.makeCall = function(phone){
		phoneService.makeCall(phone);
	};

	$scope.showNotificationOverlay = function(show) {
		if (!show)
		{	
			$scope.overlay = '';			
			if($scope.hasNewNotifications) 	
			 $scope.showNew = false;
			if($scope.hasAwayNotifications)
				$scope.showAway = false;
			if($scope.hasOldNotifications)
				$scope.showOld = false;
		}	
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};

	$scope.$on('settings_updated',function(event,data){
		if(data['instanceId'] != undefined){
			if(data['instanceId'] != localStorage.instance_id){
				$scope.anotherDevice = true;
				phoneService.registerPhone(false);
			}else{
				$scope.anotherDevice = false;
				phoneService.registerPhone(true);
			
			}
		}
	});

	$scope.activatePhone = function(){
		   myHttpService.updateSettings('instanceId','update',localStorage.instance_id); 
	}

	$scope.$on('calls_updated',function(event,data){
		//$scope.calls = {};
		var displayDesktopAlert = false;
		var toDisplayFor = settingsService.getSetting('alert_call_display_for');
		var alertDuration = settingsService.getSetting('alert_call_duration');			
		if(!phoneService.getPhoneState() && $rootScope.meModel.location.locationType == 'w'){
			return;
		}

		if(data){

			for (i in data){
				
			  $scope.calls[data[i].xpid] = data[i];

				if(data[i].contactId){
					$scope.calls[data[i].xpid].fullProfile = contactService.getContact(data[i].contactId);
				}
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
			if(nservice.isEnabled()){
					for (i in $scope.calls){
				 		var data = {};
						var left_buttonText;
						var right_buttonText;
						var left_buttonID;
						var right_buttonID;
						var right_buttonEnabled;
						if($scope.calls[i].state == fjs.CONFIG.CALL_STATES.CALL_RINGING){
							left_buttonText = $scope.calls[i].incoming ? "Decline" : "Cancel";
							right_buttonText = $scope.calls[i].incoming ? "Accept" : "";
							left_buttonID = "CALL_DECLINED";
							right_buttonID = "CALL_ACCEPTED";
							right_buttonEnabled = $scope.calls[i].incoming ? "true" : "false";
						}else if($scope.calls[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
							left_buttonText = "END";
							right_buttonText = "HOLD";	
							left_buttonID = "CALL_DECLINED";
							right_buttonID = "CALL_ON_HOLD";
							right_buttonEnabled = "true";
						}else if($scope.calls[i].state == fjs.CONFIG.CALL_STATES.CALL_HOLD){
							left_buttonText = "END";
							right_buttonText = "TALK";	
							left_buttonID = "CALL_DECLINED";
							right_buttonID = "CALL_ON_RESUME";
							right_buttonEnabled = "true";
							
						}
				 		data = {
					  			"notificationId": $scope.calls[i].xpid, 
					  			"leftButtonText" : left_buttonText,
					  			"rightButtonText" : right_buttonText,
					  			"leftButtonId" : left_buttonID,
					  			"rightButtonId" : right_buttonID,
					  			"leftButtonEnabled" : "true",
					  			"rightButtonEnabled" : right_buttonEnabled,
					  			"callerName" : $scope.calls[i].displayName, 
					  			"callStatus" : $scope.calls[i].incoming ? 'Incoming call for' : "Outgoind call for",
					  			"callCategory" : $scope.calls[i].contactId ? "Internal" : "External",
					  			"muted" : $scope.calls[i].mute ? "1" : "0",
					  			"record" : $scope.calls[i].record ? "1" : "0"
						};
						phoneService.displayWebphoneNotification(data,"INCOMING_CALL");
					}
			}else{
				$scope.displayAlert = true;
				$timeout(displayNotification, 1000);

			}
       	}
		
       	
       	if(!$.isEmptyObject(data))
		{	
		   var xpid = '';
		   for(k in data)
		   {
				xpid = k;
		   }
		   if(typeof $scope.callObj[xpid] == "undefined")
		   {	   
			   $scope.callObj[xpid] = {};
			   $scope.callObj[xpid].minutes = 0;
			   $scope.callObj[xpid].seconds = 0;
			   $scope.callObj[xpid].hours = 0;	
			   $scope.callObj[xpid].days = 0;
			   $scope.callObj[xpid].start = ntpService.calibrateTime(new Date().getTime());

		   }
		   if($scope.callObj[xpid].seconds == 0 && 
			  $scope.callObj[xpid].minutes == 0 && 
			  $scope.callObj[xpid].hours == 0 &&
			  $scope.callObj[xpid].days == 0)
		   {	   
		   		//the nativeTime is for the native Alert as it requires its own time and does its own calculations for the duration 
		   	   $scope.callObj[xpid].nativeTime = new Date().getTime();
			   $scope.callObj[xpid].stopTime = $interval(function(){
				   $scope.updateTime(xpid);
			   }, 1000);
		   }	   
		}	
		else
		{				
			if($scope.callObj[xpid])
			{
				$interval.cancel($scope.callObj[xpid].stopTime);
				$scope.callObj[xpid]= {};		
			}
		}	
       	
		if($.isEmptyObject($scope.calls)){
			phoneService.removeNotification();
		}else{
			if(displayDesktopAlert){
	       		$scope.displayAlert = true;
				$timeout(displayNotification, 1500);
			}
		}

       	if($scope.inCall && !$.isEmptyObject($scope.callObj))
       		$('.LeftBarNotificationSection.notificationsSection').addClass('withCalls');
       	else
       		$('.LeftBarNotificationSection.notificationsSection').removeClass('withCalls');
	});

	$scope.playVm = function(xpid){
		phoneService.playVm(xpid);
	};

	$scope.showCurrentCallControls = function(currentCall){
		$location.path("settings/callid/"+currentCall.xpid);
		phoneService.showCallControls(currentCall);
	};

	var displayNotification = function(){

		element = document.getElementById("Alert");
		if(element){
			content = element.innerHTML;
			phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
			
		  }
		 $scope.displayAlert = false;
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
				$scope.overlay ='notifications';
				break;
			case "enabled":
				$scope.phoneSessionEnabled = true;
				break;
			case "disabled":
				$scope.phoneSessionEnabled = false;
				break;

		}
	});

	var addTodaysNotifications = function(item){
    	var today = moment(ntpService.calibrateTime(new Date().getTime()));
		var itemDate = moment(item.time);
		var context;
		var contextId;
		if(item.context){
			context = item.context.split(":")[0];
		 	contextId = item.context.split(":")[1];
		
		}
		var isAdded = false;
		var targetId;
		var groupContextId;
		var queueContextId;
		
		if (context){
			var context = item.context.split(":")[0];
			var contextId = item.context.split(":")[1];
			switch(context){
				case "groups":
					groupContextId = contextId;
					targetId = $routeParam.groupId;
					break;
				case "contacts":
					targetId = $routeParam.contactId;
					break;
				case "conferences":
					targetId = $routeParam.conferenceId;
					break;
				case "queues":
					queueContextId = contextId;
					break;
			}
			
		}


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

		

		
		if(itemDate.startOf('day').isSame(today.startOf('day'))){
			
			// if user is in chat conversation (on chat tab) w/ other contact already (convo on screen), don't display notification...
			if (item.senderId != undefined && item.senderId == $routeParam.contactId && ($routeParam.route == undefined || $routeParam.route == 'chat')){
				$scope.remove_notification(item.xpid);				
				return false;
			}else if (groupContextId != undefined && groupContextId == $routeParam.groupId && ($routeParam.route == undefined || $routeParam.route == 'chat')){
				$scope.remove_notification(item.xpid);				
				return false;
			}else if (queueContextId != undefined && queueContextId == $routeParam.queueId && ($routeParam.route == undefined || $routeParam.route == 'chat')){
				$scope.remove_notification(item.xpid);				
				return false;
			}

			if(targetId != undefined && targetId == contextId && $routeParam.route == "chat"){
			
				return false;
			
			}else{

				for(var j = 0; j < $scope.todaysNotifications.length; j++){
						if($scope.todaysNotifications[j].xpid == item.xpid){
						$scope.todaysNotifications.splice(j,1,item);
						if(item.type == 'wall' || item.type == 'chat' || item.type == 'gchat'){
							if(!$scope.isFirstSync){
								phoneService.playSound("received");
							}
						}
						isAdded = true;
						break;	
					}
				}
				if(!isAdded){
					if(item.type == 'wall' || item.type == 'chat' || item.type == 'gchat'){
						if(!$scope.isFirstSync){
							phoneService.playSound("received");
						}
					}
					$scope.todaysNotifications.push(item);
					
				}
				
				if(displayDesktopAlert){
					if($scope.todaysNotifications.length > 0){
						$scope.displayAlert = true;
						$timeout(displayNotification
						, 1500);
					}
					//adding a second delay for the native notification to have the digest complete with the updated notifications
				}	
			}
		}
		
	};

	var deleteNotification = function(notification){
		for(var j = 0; j < $scope.notifications.length; j++){
			if($scope.notifications[j].xpid == notification.xpid){
				$scope.notifications.splice(j,1);
				break;	
			}
		}
		for(var j = 0; j < $scope.todaysNotifications.length; j++){
			if($scope.todaysNotifications[j].xpid == notification.xpid){
				$scope.todaysNotifications.splice(j,1);
				break;	
			}
		}
		if($scope.todaysNotifications.length > 0 && !$.isEmptyObject($scope.calls)){
			$timeout(displayNotification, 1500);		
		}else{
			phoneService.removeNotification();
		}
	};

	var deleteLastLongWaitNotification = function(){
		for (var i = $scope.todaysNotifications.length-1; i >= 0; i--){
			if ($scope.todaysNotifications[i].type == 'q-alert-rotation'){
				$scope.todaysNotifications.splice(i, 1);
				break;
			}
		}
		for (var j = 0; j < $scope.notifications.length; j++){
			if ($scope.notifications[j].type == 'q-alert-rotation'){
				$scope.notifications.splice(j,1);
			}
		}
	};

	$scope.$on('quickinbox_synced', function(event,data){
		//var playChatNotification = false;
		displayDesktopAlert = true;
  		var missedCalls = [];

  		if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});
			if($scope.notifications && $scope.notifications.length > 0){
				for (var i = 0; i < data.length; i++) {
					isNotificationAdded = false;
					var notification = data[i];
					notification.fullProfile = contactService.getContact(notification.senderId);
					notification.label == '';
							if(notification.type == 'q-alert-rotation'){
								notification.label = $scope.verbage.long_waiting_call;
								var long_waiting_notification = angular.copy(notification);
								long_waiting_calls[notification.xpid] = notification;
							}else if(notification.type == 'q-alert-abandoned'){
								notification.label = 'abandoned call';
								notification.message = "";
								var abandoned_notification = angular.copy(notification);
								// once it's an abandoned call, want long-wait-note to disappear
								deleteLastLongWaitNotification();
								$timeout(function(){
									deleteNotification(abandoned_notification);
								}, 60000);
							}else if(notification.type == 'q-broadcast'){
								notification.label = 'broadcast message';
							}else if(notification.type == 'gchat'){
								notification.label = "group chat to";
							}else if(notification.type == 'vm'){
								notification.label =$scope.verbage.voicemail;
							}else if(notification.type == 'chat'){
								notification.label = 'chat message';
							}else if(notification.type == 'missed-call'){
                 				notification.label = 'missed call';
                 				missedCalls.push(notification);
							}else if(notification.type == 'busy-ring-back'){
                				notification.label = 'is now available for call';
								notification.message= "User is free for call";
							}else if(notification.type == "description"){
								notification.label = "chat message"
								notification.message = "<strong>Goodbye " + notification.data.groupId + "!</strong><br />" + notification.message;	
							}else if(notification.type == 'wall'){
								notification.label = "share";
							}
					if(notification.audience == "conference"){
						var xpid = notification.context.split(':')[1];
						var conference = conferenceService.getConference(xpid);
						notification.conference = conference;
					}

					if(notification.xef001type != "delete"){

						for(var j = 0; j < $scope.notifications.length; j++){
							if($scope.notifications[j].xpid == notification.xpid){
								$scope.notifications.splice(j,1,notification);
								isNotificationAdded = true;
								break;	
							}
						}
						if(!isNotificationAdded){							
							$scope.notifications.push(notification);
							
						}
						addTodaysNotifications(notification);

					}else if(notification.xef001type == "delete"){
						if(long_waiting_calls[notification.xpid] == undefined){
							deleteNotification(notification);
						}
					}
				}
				$scope.notifications.sort(function(a, b){
					return b.time - a.time;
				});
			}else{
				for (var i = 0; i < data.length; i++) {
					var notification = data[i];
					notification.fullProfile = contactService.getContact(notification.senderId);
					notification.labelType == '';
					if(notification.type == 'q-alert-rotation'){
						notification.label = $scope.verbage.long_waiting_call;
					}else if(notification.type == 'q-alert-abandoned'){
						notification.label = 'abandoned call';
						notification.message = "";
						deleteLastLongWaitNotification();
						$timeout(function(){
							deleteNotification(notification);
						}, 60000);
					}else if(notification.type == 'q-broadcast'){
						notification.label = 'broadcast message';
					}else if(notification.type == 'gchat'){
						notification.label = "group chat to";
					}else if(notification.type == 'vm'){
						notification.label = $scope.verbage.voicemail;
					}else if(notification.type == 'chat'){
						notification.label = 'chat message';
					}else if(notification.type == 'missed-call'){
                				notification.label = 'missed call';
                				missedCalls.push(notification);
					}else if(notification.type == 'busy-ring-back'){
            			notification.label = 'is now available for call';
						notification.displayName = notification.fullProfile.displayName;
						notification.message= "User is free for call";
					}else if(notification.type == "description"){
						notification.label = "chat message"
						notification.message = "<strong>Goodbye " + notification.data.groupId + "!</strong><br />" + notification.message;	
					}else if(notification.type == 'wall'){
								notification.label = "share";
					}
					
					if(notification.audience == "conference"){
						var xpid = notification.context.split(':')[1];
						var conference = conferenceService.getConference(xpid);
						notification.conference = conference;
					}
					if(notification.xef001type != "delete"){
						$scope.notifications.push(notification);
						addTodaysNotifications(notification);
					}
				}
			}
		};

		 

		$scope.todaysNotifications = $scope.todaysNotifications.sort(function(a,b){
			return a.time - b.time; 
		});
			       
		if($scope.todaysNotifications && $scope.todaysNotifications.length > 3){
			$scope.showNotificationBody = false;
		}else{
			$scope.showNotificationBody = true;
		}
		if(!$scope.todaysNotifications || $scope.todaysNotifications.length == 0)
			 $scope.hasMessages = false;
		else
		   	$scope.hasMessages = true;	
			$scope.totalTodaysNotifications = $scope.todaysNotifications.length;

		
			
		if(displayDesktopAlert){
			//nservice.isEnabled(
			if(true){
		
			 for (var i = 0; i < missedCalls.length;i++){
			 	 var missedCall = missedCalls[i];
			 	 var data = {
			 	 	"notificationId": missedCall.senderId ? missedCall.senderId  : missedCall.phone, 
  					"leftButtonText" : "Chat",
  					"rightButtonText" : "Call",
  					"leftButtonId" : "CHAT_REQUEST",
  					"rightButtonId" : "CALL_REQUEST",
  					"leftButtonEnabled" : "true",
  					"rightButtonEnabled" : "true",
  					"callerName" : missedCall.displayName, 
  					"callMessage" :"...you have a missed call",
  					"callLocation" : "External",
  					"callDate" : "Today, 1:03pm",
   					//"phoneStatus" : "mute"
			 	 };

			 	 phoneService.displayWebphoneNotification(data,"MISSED_CALL");


			 }
			}else{
				$timeout(displayNotification, 1000);
			}

		}				

    });		
}]);
