hudweb.controller('NotificationController', ['$scope', '$rootScope', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService','ConferenceService','$timeout','NtpService', 
	function($scope, $rootScope, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService,conferenceService,$timeout,ntpService){

	var playChatNotification = false;
	var displayDesktopAlert = true;
		
	$scope.notifications = [];
	$scope.calls = [];
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
	$scope.callObj = {};
	$scope.anotherDevice = false;
	$scope.clearOld;
	
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
    
	phoneService.getDevices().then(function(data){
		$scope.phoneSessionEnabled = true;
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
				if(message.vm.transcription != ""){
					return vm.transcription;
				}else{
					return "transcription is not available";
				}
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

	// required to show new messages on-the-fly
	$scope.formatMessage = function(message){		
		switch(message.type){
			case "vm":
				if(message.vm.transcription != ""){
					return vm.transcription;
				}else{
					return "transcription is not available";
				}
				break;
			case 'missed-call':	
				return "Missed call from extension " + message.phone; 
				break;
			default:
				return message.message.replace(/\n/g, '<br/>');
		}
	};

	$scope.getNotificationsLength = function(length)
	{
		var length = $scope.phoneSessionEnabled ? length : length + 1;
		
		return length;
	};
	
	$scope.remove_notification = function(xpid){
		for(var i = 0, iLen = $scope.notifications.length; i < iLen; i++){
			if($scope.notifications[i].xpid == xpid){
				$scope.notifications.splice(i,1);
				break;
			}
		}

		for(var j = 0, jLen = $scope.todaysNotifications.length; j < jLen; j++){
			if($scope.todaysNotifications[j].xpid == xpid){
				$scope.todaysNotifications.splice(j,1);
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
		var new_notifications = $scope.notifications.filter(function(item){
			var date = new Date(item.time);
			var today = new Date();
			var toReturn = false;
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
		var away_notifications = $scope.notifications.filter(function(item){
			return item.receivedStatus == "away"; 
		});
		if(away_notifications.length > 0)
			$scope.hasAwayNotifications = true;
		
		$scope.awayNotificationsLength = away_notifications.length;
		$scope.awayNotifications = away_notifications;
    	
		return away_notifications;
	};

	$scope.get_old_notifications= function(){
		var old_notifications = $scope.notifications.filter(function(item){
			var date = new Date(item.time);
			var today = new Date();
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
											
		// want to remove the 'clear' and 'hide' buttons when 'clear' button is pressed, but don't want entire overlay to close...
		$scope.clearOld = true;
	};
	
	$scope.remove_all = function(){

		$scope.notifications = [];
		$scope.todaysNotifications = [];

		myHttpService.sendAction('quickinbox','removeAll');
			
		$scope.showNotificationOverlay(false);
		$scope.hasAwayNotifications = false;
		$scope.hasOldNotifications = false;
	};

	$scope.go_to_notification_chat = function(message){
		var endPath;
		var calllogPath = '/calllog/calllog';

		if (message.context){
			var context = message.context;
			var xpid = context.split(':')[1];
		}

		switch(message.type){
			case 'error':
				$rootScope.pbxError = message.receivedStatus == "offline";
				$rootScope.$evalAsync($rootScope.$broadcast('network_issue',{}));
				return;
			case 'chat':
			case 'wall':
			case 'description':
			case 'gchat':
				endPath = "/" + message.audience + "/" + xpid + '/chat';
				break;
			case 'missed-call':
				if (message.senderId || message.fullProfile)
					endPath = "/" + message.audience + "/" + xpid + '/chat';
				else
					endPath = calllogPath;
				break;
			case 'vm':
				if (message.senderId || message.fullProfile)
					endPath = "/" + message.audience + "/" + xpid + '/voicemails';
				else
					endPath = "/calllog/voicemails";
				break;
			case 'q-broadcast':
				endPath = "/" + message.audience + "/" + message.queueId + '/alerts';
				break;
			case 'q-alert-abandoned':
				endPath = "/" + message.audience + "/" + message.queueId + '/stats';
				break;
		}

		$location.path(endPath);
		$scope.remove_notification(message.xpid);
		$scope.showNotificationOverlay(false);
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
			for(var call in $scope.calls){
				if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
					$scope.holdCall($scope.calls[call].xpid,true);
				}
			}
			$scope.onHold = false;
		}
	};

	$scope.acceptCall = function(xpid){
		for(var call in $scope.calls){
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
	};

	$scope.$on('calls_updated',function(event,data){
		displayDesktopAlert = false;
		
		var toDisplayFor = settingsService.getSetting('alert_call_display_for');
		var alertDuration = settingsService.getSetting('alert_call_duration');			
		if(!phoneService.getPhoneState() && $rootScope.meModel.location.locationType == 'w'){
			return;
		}

		$scope.calls = [];
		
		if(data){

			for (var i in data){
				$scope.calls[data[i].xpid] = data[i];
				var found = false;
				var profile;
				$scope.calls.push(data[i]);		
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
	
		}
		
		$scope.inCall = $scope.calls.length > 0;

		$scope.isRinging = true;
		
		$scope.calls.sort(function(a,b){
			return a.created - b.created;
		});
       
       	
       	if(!$.isEmptyObject(data))
		{	
		   var xpid = '';
		   for(var k in data)
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
		   }	   
		}	
		else
		{				
			if($scope.callObj[xpid])
			{
				$scope.callObj[xpid]= {};		
			}
		}	
       	
		if($scope.calls.length <  1){
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

		var element = document.getElementById("Alert");
		
		if(element){
			var content = element.innerHTML;
			phoneService.displayNotification(content,element.offsetWidth,element.offsetHeight);
		}
		
		element = null;
		$scope.displayAlert = false;
	};

	$scope.$on('phone_event',function(event,data){
		var phoneEvent = data.event;
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
			var queue = queueService.getQueue(item.queueId);
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

				for(var j = 0, jLen = $scope.todaysNotifications.length; j < jLen; j++){
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
		for(var j = 0, jLen = $scope.notifications.length; j < jLen; j++){
			if($scope.notifications[j].xpid == notification.xpid){
				$scope.notifications.splice(j,1);
				break;	
			}
		}
		for(var k = 0, kLen = $scope.todaysNotifications.length; k < kLen; k++){
			if($scope.todaysNotifications[k].xpid == notification.xpid){
				$scope.todaysNotifications.splice(k,1);
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
		for (var j = 0, jLen = $scope.notifications.length; j < jLen; j++){
			if ($scope.notifications[j].type == 'q-alert-rotation'){
				$scope.notifications.splice(j,1);
				jLen--;
			}
		}
	};

	$scope.$on('quickinbox_synced', function(event,data){
		displayDesktopAlert = true;

  		if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});
			if($scope.notifications && $scope.notifications.length > 0){
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					var isNotificationAdded = false;
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
								var vms = phoneService.getVoiceMailsFor(notification.senderId,notification.audience);
								var vm = phoneService.getVoiceMail(notification.vmId);
								notification.vm = vm;
								notification.label = 'you have ' +  vms.length + ' new voicemail(s)';
								
							}else if(notification.type == 'chat'){
								notification.label = 'chat message';
							}else if(notification.type == 'missed-call'){
                				notification.label = 'missed call';
							}else if(notification.type == 'busy-ring-back'){
                				notification.label = 'is now available for call';
								notification.message= "User is free for call";
							}else if(notification.type == "description"){
								notification.label = "chat message"
								notification.message = "<strong>Goodbye " + notification.data.groupId + "!</strong><br />" + notification.message;	
							}else if(notification.type == 'wall'){
								notification.label = "share";
							}else if(notification.type == 'error'){
								notification.displayName = 'Error';
								notification.message = 'Open for Details';
							}
					if(notification.audience == "conference"){
						var xpid = notification.context.split(':')[1];
						var conference = conferenceService.getConference(xpid);
						notification.conference = conference;
					}

					if(notification.xef001type != "delete"){

						for(var j = 0, jLen = $scope.notifications.length; j < jLen; j++){
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
				for (var i = 0, iLen = data.length; i < iLen; i++) {
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
						var vms = phoneService.getVoiceMailsFor(notification.senderId,notification.audience);
						var vm = phoneService.getVoiceMail(notification.vmId);
						notification.vm = vm;
						notification.label = 'you have ' +  vms.length + ' new voicemail(s)';
						
					}else if(notification.type == 'chat'){
						notification.label = 'chat message';
					}else if(notification.type == 'missed-call'){
            			notification.label = 'missed call';
					}else if(notification.type == 'busy-ring-back'){
            			notification.label = 'is now available for call';
						notification.displayName = notification.fullProfile.displayName;
						notification.message= "User is free for call";
					}else if(notification.type == "description"){
						notification.label = "chat message"
						notification.message = "<strong>Goodbye " + notification.data.groupId + "!</strong><br />" + notification.message;	
					}else if(notification.type == 'wall'){
								notification.label = "share";
					}else if(notification.type == 'error'){
							notification.displayName = 'Error';
							notification.message = 'Open for Details';
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

	});		
}]);
