hudweb.controller('NotificationController', 
  ['$scope', '$rootScope', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService','ConferenceService', 'GroupService', '$timeout','NtpService','NotificationService', '$sce', '$window', 'StorageService', '$q',
  function($scope, $rootScope, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService,conferenceService,groupService,$timeout,ntpService,nservice, $sce, $window, storageService, $q){
  var playChatNotification = false;
  var displayDesktopAlert = true;
  $scope.notifications = nservice.notifications  || [];
  $scope.todaysNotifications = nservice.todaysNotifications || [];
  $scope.errors = nservice.errors || [];
  $scope.calls = [];
  var long_waiting_calls = {};
  var msgXpid;
  var numberOfMyCalls = 0;
  var pbxErrorId = null;
  $scope.inCall = false;
  $scope.inRinging = false;
  $scope.path = $location.absUrl().split("#")[0];
  $scope.messageLimit = 300;
  $scope.showNotificationBody = true;
  $scope.showHeader = false;  
  $scope.hasMessages = false;
  $scope.showTimer = false;
  $scope.selectedStatsTab = false;
  $scope.selectedCallsTab = false;
  $scope.notifications_to_display = '';
  $scope.new_notifications_to_display = '';
  $scope.away_notifications_to_display = '';
  $scope.old_notifications_to_display = ''; 
  $scope.multiple_old_notifications = false;
  $scope.multiple_new_notifications =  false;
  $scope.multiple_away_notifications =  false;
  $scope.message_section_notifications = '';
  $scope.hasNewNotifications = false;
  $scope.hasAwayNotifications = false;
  $scope.hasOldNotifications = false;
  $scope.newNotificationsLength = 0;
  $scope.awayNotificationsLength = 0;
  $scope.oldNotificationsLength = 0;
  $scope.newNotifications = [];
  $scope.awayNotifications = [];
  $scope.oldNotifications = []; 
  $scope.numshowing = 0;
  $scope.totalTodaysNotifications = 0;
  $scope.showing = 4;
  $scope.showAllNotifications = false;
  $scope.showNew = false;
  $scope.showAway = false;
  $scope.showOld = false;
  $scope.clearOld;
  $scope.alertDuration = settingsService.getSetting('alert_call_duration');    
  
    $scope.addError = function(type) {
        for (var i = 0, len = $scope.errors.length; i < len; i++) {
            // find existing
            if ($scope.errors[i].xpid == type)
                return;
        }
		
		// add new
		var data = {
			xpid: type,
			type: 'error',
			displayName: '',
			message: ''
		};
			
		switch(type) {
			case 'networkError':
				data.displayName = 'Error';
				data.message = 'Click to open details';
				break;
		}
        
        $scope.errors.push(data);
		
		// update native alert
		if (displayDesktopAlert) {
				phoneService.displayWebphoneNotification(data, 'error', false);
		}
    };
    
    $scope.dismissError = function(type) {
        for (var i = 0, len = $scope.errors.length; i < len; i++) {
            // find existing and remove
            if ($scope.errors[i].xpid == type) {
                $scope.errors.splice(i, 1);

                break;
            }
        }
    };

    // connectivity error
    $scope.$on('network_issue', function(event, data) {
        if (data) {
            $scope.addError('networkError');
            $rootScope[data] = true;
        
            // show pop-up
            if ($rootScope.isFirstSync) {
                $scope.showOverlay(true,'NetworkErrorsOverlay', {});
				$scope.$safeApply();
			}
        }
        else {
            $scope.dismissError('networkError');
			            
            $rootScope.networkError = false;
            $rootScope.phoneError = false;
            $rootScope.pbxError = false;
        }
    });
	

  
  $scope.getMultipleNotifications = function(message){	
	  var messages = message.message && message.message != null && message.message != "" ? ((message.message).indexOf('\n') != -1 ? (message.message).split('\n') : (message.message) ) : '';
	  
	  if(typeof messages === 'string')
		  return false;
	  if(Array.isArray(messages))
	      return true;
  };
  
  $scope.getMessage = function(message){              
    //var messages = message.message && message.message != null && message.message != "" ? ((message.message).indexOf('\n') != -1 ? (message.message).split('\n') : (message.message) ) : '';      
    var messages = '';
    
    if(message.message && message.message != null && message.message != "")
    {
    	if((message.message).indexOf('\n') != -1)//array
    		messages = (message.message).split('\n');    		
    	else //string
    		messages = message.message;
    } 
    
    switch(message.type){

      case "vm":
        if(message.vm && message.vm.transcription != ""){
        	messages =  vm.transcription;
        }else{
        	messages =  "transcription is not available";
        }
        break;
      case 'missed-call': 
    	  messages =  "Missed call from extension " + message.phone; 
        break;      
    }
    return messages;
  };

  $scope.remove_notification = function(xpid){
    
    myHttpService.sendAction('quickinbox','remove',{'pid':xpid});
    myHttpService.deleteFromWorker('quickinbox', xpid);
    delete_notification_from_notifications_and_today(xpid);
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
      if(settingsService.getSetting('alert_vm_show_new') != 'true'){
          if(item.type == 'vm'){
        	  toReturn = false;
          }
      }
      if(item.audience == 'queue')
  	  {
    	    if(item.type == 'q-alert-abandoned')
			{
    	    	//workaround: get the queue display name from the queue service
    	    	var queue = queueService.getQueue(item.queueId);
    	    	item.displayName = queue.name;
    	    	
				if(settingsService.getSetting('HUDw_QueueNotificationsAb_'+ item.queueId) == 'undefined' ||
				   !settingsService.getSetting('HUDw_QueueNotificationsAb_'+ item.queueId))
					toReturn = false;				
			}
			else if(item.type == 'q-alert-rotation')
			{
				if(settingsService.getSetting('HUDw_QueueNotificationsLW_'+ item.queueId)  == 'undefined' ||
				   !settingsService.getSetting('HUDw_QueueNotificationsLW_'+ item.queueId))
				   toReturn = false;			
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
      return (((date.getTime() < today.getTime() && 
    		    date.getDate() < today.getDate()) && 
    		    date.getMonth() == today.getMonth() &&  
    		    date.getFullYear() == today.getFullYear()) || 
    		    date.getFullYear() < today.getFullYear() || 
    		    (date.getFullYear() == today.getFullYear() && 
    		     date.getMonth() < today.getMonth())) && 
    		     item.receivedStatus != "away"; 
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
		myHttpService.deleteFromWorker('quickinbox', nIndex_xpid);
		
        $scope.oldNotifications.splice(0,1);
    } 
    
    $scope.hasOldNotifications = false; 
    $scope.oldNotifications = [];         
                      
    // want to remove the 'clear' and 'hide' buttons when 'clear' button is pressed, but don't want entire overlay to close...
    $scope.clearOld = true;
  };
  
  $scope.remove_all = function(){

	// empty arrays without breaking reference
    $scope.notifications.splice(0, $scope.notifications.length);
    $scope.todaysNotifications.splice(0, $scope.todaysNotifications.length);
	$scope.errors.splice(0, $scope.errors.length);

    myHttpService.sendAction('quickinbox','removeAll');
    myHttpService.deleteFromWorker('quickinbox');
      
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
      case 'chat':
      case 'wall':
      case 'description':
      case 'barge message':
      case 'gchat':

        //check to make sure if message audience was a group and wasn't deleted. Else create path for chat.
        var groupChat = groupService.getGroup(xpid);
        if(message.audience == "group" && groupChat == null){
          alert("We apologize but this Group no longer exists");  
        }
        else{
          endPath = "/" + message.audience + "/" + xpid + '/chat';
        }
        break;
      case 'missed-call':
        // external contact --> go to voicemails tab
        if (message.fullProfile && message.fullProfile.primaryExtension == ""){
          // $scope.remove_notification(message.xpid);
          // ^ commentted out -> user can only dismiss notification by clicking on "x" 
          $scope.showOverlay(false);
          return;
        }
        else if (message.senderId || message.fullProfile)
          endPath = "/" + message.audience + "/" + xpid + '/chat';
        else
          endPath = calllogPath;
        break;
      case 'vm':
        endPath = "/calllog/voicemails";
	  
    		// if already on tab, broadcast id
    		if ($location.path() == endPath)
    			$rootScope.$broadcast('vmToOpen', message.vmId);
    		else
    			$rootScope.vmToOpen = message.vmId;
	  
        break;
      case 'q-broadcast':
        endPath = "/" + message.audience + "/" + message.queueId + '/alerts';
        break;
      case 'q-alert-abandoned':
    	//workaround: get the queue display name from the queue service
    	var queue = queueService.getQueue(message.queueId);
    	message.displayName = queue.name;
        endPath = "/" + message.audience + "/" + message.queueId + '/stats';
      case 'busy-ring-back':
        $scope.makeCall(message);
        $scope.remove_notification(message.xpid);
        break;
    }
      
    
    $location.path(endPath);
    $scope.remove_notification(message.xpid);
    $scope.showOverlay(false);
  };

  
  
  $scope.showQueue = function(message)
    {

    var qid = message.queueId;
    $('.Widget.Queues .WidgetTabBarButton').removeClass('fj-selected-item');
    if(message.type == 'q-alert-abandoned')   
    {
      //workaround: get the queue display name from the queue service
      var queue = queueService.getQueue(message.queueId);
      message.displayName = queue.name;	
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
    for(var i = 0; i < $scope.calls.length;i++){
      if($scope.calls[i].xpid == xpid){
        $scope.calls.splice(i,1);
        break;
      }
    }

  };

  $scope.holdCall = function(xpid,isHeld){
    phoneService.holdCall(xpid,isHeld);
    if(!isHeld){
      for(var call = 0; call < $scope.calls.length; call++){
        if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
          $scope.holdCall($scope.calls[call].xpid,true);
        }
      }
      $scope.onHold = false;
    }
  };

  $scope.acceptCall = function(xpid, message, currentCall){
    for(var call = 0; call < $scope.calls.length; call++){
      if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
        $scope.holdCall($scope.calls[call].xpid,true);

      }
      // if the user's incoming call is a queue call --> force change that call's state to ACCEPTED so that "End" and "Hold" appear. This is for the "Press to Accept" permission (HUDF-1338) to work properly.
      if (currentCall.type == $scope.calltype.QUEUE_CALL && $scope.calls[call].xpid == xpid){
        $scope.calls[call].state = $scope.callState.CALL_ACCEPTED;
      }
      ga('send', 'event', {eventCategory:'Calls', eventAction:'Receive', eventLabel: 'Answer from Notification'});
    }
	
    phoneService.acceptCall(xpid);
  };

  $scope.makeCall = function(message){
    if (message.type == 'busy-ring-back'){
      phoneService.makeCall(message.fullProfile.primaryExtension);
      $scope.showOverlay(false);
    }
    else{
      phoneService.makeCall(message.phone);
      $scope.remove_notification(message.xpid);
      $scope.showOverlay(false);
    }

    ga('send', 'event', {eventCategory:'Calls', eventAction:'Place', eventLabel: 'From Notification'});
  };
  
  $scope.joinZoom = function(message) {
      var urlPath = message.message.split(': ')[1];
      window.open(urlPath, "_blank");
	  
      $scope.remove_notification(message.xpid);
      ga('send', 'event', {eventCategory:'Video Conference', eventAction:'Join', eventLabel: 'From Notification'});
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
    $scope.alertDuration = data['alert_call_duration'];
  });

  var prepareBargeNotification = function(contactObj){
    var myCallBarger = contactObj.call.bargers[0];
    var msgDate = moment(ntpService.calibrateTime(new Date().getTime()));
    var personBeingWhisperedUpon = contactObj.call.bargers[0].call.contactId;
    msgXpid = msgDate + '';
    switch(contactObj.call.bargers[0].call.barge){
      case 1:
        sendBargeNotification(myCallBarger, msgDate, msgXpid, 'monitor');
        break;
      case 2:
        sendBargeNotification(myCallBarger, msgDate, msgXpid, 'barge');
        break;
      case 3:
        sendBargeNotification(myCallBarger, msgDate, msgXpid, 'whisper', personBeingWhisperedUpon);
        break;
    }
  };

  var bargeFlag = false;

  var sendBargeNotification = function(callBarger, msgDate, msgXpid, type, whisperId){
    var extraNotification, typeLabel;
    switch (type) {
      case 'barge':
        typeLabel = "You are being barged by";
        break;
      case 'monitor':
        typeLabel = "You are being monitored by";
        break;
      case 'whisper':
        typeLabel = "You are being whispered by";
        break;
    }
    extraNotification = {
      displayName: "Call Monitoring",
      context: "contact:" + callBarger.xpid,
      message: callBarger.displayName,
      audience: 'contact',
      time: msgDate,
      type: "barge message",
      xpid: msgXpid,
      label: typeLabel
    };
    // don't send notification to the party that's NOT being whispered to
    if (type != 'whisper' || type == 'whisper' && $rootScope.myPid == whisperId){
      bargeFlag = true;
      $scope.notifications.unshift(extraNotification);
      $scope.todaysNotifications.push(extraNotification);
      if (displayDesktopAlert)
        phoneService.displayWebphoneNotification(extraNotification,"",false);
    }
  };

  var delete_notification_from_notifications_and_today = function(xpid){
    if (xpid){
      for(var i = 0, iLen = $scope.notifications.length; i < iLen; i++){
        if($scope.notifications[i].xpid == xpid){
          $scope.notifications.splice(i,1);
          break;
        } else if ($scope.notifications[i].vmId == xpid){
          $scope.notifications.splice(i,1);
          break;
        }
      }

      for(var j = 0, jLen = $scope.todaysNotifications.length; j < jLen; j++){
        if($scope.todaysNotifications[j].xpid == xpid){
          $scope.todaysNotifications.splice(j,1);
          break;
        } else if ($scope.todaysNotifications[j].vmId == xpid){
          $scope.todaysNotifications.splice(j,1);
          break;
        }
      }
    }
  };
  
  // sends adjusted timestamp to phone plugin
  $scope.getNativeTime = function(time) {
	  return ntpService.calibrateNativeTime(new Date(time).getTime());
  };


  $scope.$on('calls_updated',function(event,data){
    displayDesktopAlert = false;
    var toDisplayFor = settingsService.getSetting('alert_call_display_for');
    var alertDuration = settingsService.getSetting('alert_call_duration');      


    $scope.calls = [];
    
    if(data){

      for (var i in data){
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

    var myContactObj = contactService.getContact($rootScope.myPid);
    
    // if someone barges...
    if ((bargeFlag && !myContactObj.call) || (bargeFlag && myContactObj.call.bargers && myContactObj.call.bargers.length == 0)){
      delete_notification_from_notifications_and_today(msgXpid);
      bargeFlag = false;
    } else if (myContactObj.call && myContactObj.call.bargers && myContactObj.call.bargers.length > 0){
      // delete any existing barge-notification...
      if (bargeFlag && msgXpid){
        delete_notification_from_notifications_and_today(msgXpid);
        bargeFlag = false;
      }
      // start creation of new barge notification...
      prepareBargeNotification(myContactObj);
    } 

    $scope.inCall = $scope.calls.length > 0;

    $scope.isRinging = true;
    
    $scope.calls.sort(function(a,b){
      return a.created - b.created;
    });
      	
	//$scope.inCall = $scope.calls.length > 0;
	//$scope.isRinging = true;
		
		if($scope.inCall)
        	$('.LeftBarNotificationSection.notificationsSection').addClass('withCalls');
    else
			$('.LeftBarNotificationSection.notificationsSection').removeClass('withCalls');
	   
	});

	$scope.showCurrentCallControls = function(currentCall){
		$location.path("settings/callid/"+currentCall.xpid);
	};

	$window.onfocus = function() {
		// delete notifications when hudweb is back in focus
		if ($routeParam.route) {
			for (var i = 0, len = $scope.todaysNotifications.length; i < len; i++) {
				var note = $scope.todaysNotifications[i];
				
				if (note.context)
					var context = note.context.split(':')[1];
				else
					continue;
				
				// normal chats
				if (note.type.indexOf('chat') != -1 && $routeParam.route == 'chat') {
					if (($routeParam.contactId && $routeParam.contactId == context) || ($routeParam.conferenceId && $routeParam.conferenceId == context) || ($routeParam.groupId && $routeParam.groupId == context) || ($routeParam.queueId && $routeParam.queueId == context))
						$scope.remove_notification(note.xpid);
				}
				// alerts
				else if (note.type == 'q-broadcast' && $routeParam.route == 'alerts') {
					if ($routeParam.queueId && $routeParam.queueId == context)
						$scope.remove_notification(note.xpid);
				}
			}
		}
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
				$scope.showOverlay(true, 'NotificationsOverlay', {});
				break;
			case "enabled":
				//$scope.phoneSessionEnabled = true;
				break;
			case "disabled":
				//$scope.phoneSessionEnabled = false;
				break;
      case 'dismissError':
        $scope.dismissError(data.type);
        break;
		}
		if($scope.isRinging)
		{
			if(phoneService.getBrowserOnFocus())
			{
				if(settingsService.getSetting('hudmw_show_alerts_always') != 'true')
				{	
					phoneService.isDocumentHidden(true);
				}
				else
				{
					phoneService.isDocumentHidden(false);
				}						
			}
			else
			{
				if(settingsService.getSetting('hudmw_show_alerts_always') != 'true')
				{	
					phoneService.isDocumentHidden(false);
				}
				else
				{
					phoneService.isDocumentHidden(true);
				}						
			}
		}	
	});
  var addTodaysNotifications = function(item){
    displayDesktopAlert = true;
    
    var context, contextId;
    var today = moment(ntpService.calibrateTime(new Date().getTime()));
    var itemDate = moment(item.time);
    var isAdded = false;

    if(item.context){
      context = item.context.split(":")[0];
      contextId = item.context.split(":")[1];
    }
	
    if(settingsService.getSetting('alert_vm_show_new') != 'true'){
      if(item.type == 'vm'){
        displayDesktopAlert = false;
      }
    }
	
	if (item.incoming !== undefined) {
		if((settingsService.getSetting('alert_call_outgoing') != 'true' && !item.incoming) || 
		   (settingsService.getSetting('alert_call_incoming') != 'true' && item.incoming))
		{
			displayDesktopAlert = false;
		}
	}

    if(item.audience == 'queue')
	{
			if(item.type == 'q-alert-abandoned')
			{
				//workaround: get the queue display name from the queue service
				var queue = queueService.getQueue(item.queueId);
				item.displayName = queue.name;
				if(typeof settingsService.getSetting('HUDw_QueueAlertsAb_'+ item.queueId) == 'undefined' || 
				   !settingsService.getSetting('HUDw_QueueAlertsAb_'+ item.queueId))
					displayDesktopAlert = false;				
			}
			if(item.type == 'q-alert-rotation')
			{
				if(typeof settingsService.getSetting('HUDw_QueueAlertsLW_'+ item.queueId) == 'undefined' || 
				   !settingsService.getSetting('HUDw_QueueAlertsLW_'+ item.queueId))
					displayDesktopAlert = false;				
			}	
				
	}
    item.displayDesktopAlert =  displayDesktopAlert;
    // if message is from today...
    if(itemDate.startOf('day').isSame(today.startOf('day'))){

      // if user is in chat conversation (on chat tab) w/ other contact already (convo on screen), don't display notification...
      if (phoneService.getBrowserOnFocus() && contextId && $routeParam.route) {
		if (item.type.indexOf('chat') != -1 && $routeParam.route == 'chat') {
			if (($routeParam.contactId && $routeParam.contactId == contextId) || ($routeParam.conferenceId && $routeParam.conferenceId == contextId) || ($routeParam.groupId && $routeParam.groupId == contextId) || ($routeParam.queueId && $routeParam.queueId == contextId)) {
				$scope.remove_notification(item.xpid);
				return false;
			}
		}
		else if (item.type == 'q-broadcast' && $routeParam.route == 'alerts') {
			if ($routeParam.queueId && $routeParam.queueId == contextId) {
				$scope.remove_notification(item.xpid);
				return false;
			}
		}
      }
      
       var dupe = false;
       var combinedMsg = false;
        for (var j = 0, jLen = $scope.todaysNotifications.length; j < jLen; j++){
               // take into account that 2 msgs in a row from the same contact are combined into 1 message
               if (item.xpid == $scope.todaysNotifications[j].xpid && item.xef001iver != $scope.todaysNotifications[j].xef001iver ){
                       // it's a dupe but combined msg, but still want to play chat sound
                       dupe = true;
                       combinedMsg = true;
                       break;
               }
               if (item.xpid == $scope.todaysNotifications[j].xpid){
                       // dupe, don't want to play chat sound
                       dupe = true;
                       break;
               }
        }

        // if not a dupe, or it's the second in a string of msgs in a row, still play chat sound
        if (dupe && combinedMsg || !dupe){
               if (item.type == 'wall' || item.type == 'chat' || item.type == 'gchat' || item.type == 'description'){
                       if (!$scope.isFirstSync){
                               phoneService.playSound('received');
                       }
               }
        }

        // if dupe but also a combined message --> find and replace msg in todaysnotifications
        if (combinedMsg){
               for (var i = 0, iLen = $scope.todaysNotifications.length; i < iLen; i++){
                       if (item.xpid == $scope.todaysNotifications[i].xpid){
                               $scope.todaysNotifications.splice(i, 1, item);
                       }
               }
        } else if (dupe){
               // dupe --> don't add to todaysNotifications
               return;
        } else {
          if(item.audience == 'queue')
      	  {
      			if(item.type == 'q-alert-abandoned')
      			{
      			    //workaround: get the queue display name from the queue service
      				var queue = queueService.getQueue(item.queueId);
      	            item.displayName = queue.name;
      				if(settingsService.getSetting('HUDw_QueueNotificationsAb_'+ item.queueId))
      					$scope.todaysNotifications.push(item);				
      			}
      			else if(item.type == 'q-alert-rotation')
      			{
      				if(settingsService.getSetting('HUDw_QueueNotificationsLW_'+ item.queueId))
      					$scope.todaysNotifications.push(item);				
      			}	
      			else
      				$scope.todaysNotifications.push(item);
      	  }	
          else	
               // otherwise add to todaysNotes
               $scope.todaysNotifications.push(item);

        }
      					 
   
      if (displayDesktopAlert){
               if ($scope.todaysNotifications.length > 0){
                      phoneService.setStayHidden(false);
                          phoneService.displayWebphoneNotification(item,"",false);

             }
      }

    }
  };

	var deleteNotification = function(notification){
    
    delete_notification_from_notifications_and_today(notification.xpid);
    $rootScope.currentNotificationLength = $scope.todaysNotifications.length;

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

  var updateNotificationLabel  = function(notification){
    var type = notification.type; 
    
    switch(type){
      case 'q-alert-rotation':
        notification.label = $scope.verbage.long_waiting_call;
        var long_waiting_notification = angular.copy(notification);
        long_waiting_calls[notification.xpid] = notification;
        $timeout(function(){
          // if user unchecks abandoned call notifications, still need to delete long wait notification
          deleteLastLongWaitNotification();
        }, 60000);
        break;
      case 'q-alert-abandoned':
        notification.label = '...abandoned call';
        notification.message = "";
        //workaround: get the queue display name from the queue service
        var queue = queueService.getQueue(notification.queueId);
        notification.displayName = queue.name;
        var abandoned_notification = angular.copy(notification);            
        // once it's an abandoned call, want long-wait-note to disappear
        deleteLastLongWaitNotification();
        $timeout(function(){deleteNotification(abandoned_notification);}, 60000);
        break;
      case 'q-broadcast':
        notification.label = 'broadcast message';
    		// add queue name
    		var queue = queueService.getQueue(notification.queueId);
    		notification.displayName = queue.name;
        break;
      case 'gchat':
        // differentiate b/w group chat and queue chat
        if (notification.audience == 'group')
          notification.label = "group chat to";
        else if (notification.audience == 'queue')
          notification.label = 'queue chat to';
        break;
      case 'vm':
          // retrieve vms
         phoneService.getVm().then(function(data){
            var allVms = data;
            var todaysVms = [];
            var oldVms = [];
            var currentVm, groupVms, totalVm;
            var id = notification.senderId;
            var type = notification.audience;

            switch(type){
              case 'contact':
                // get new
                for (var i = 0; i < allVms.length; i++){
                  var cur = allVms[i];
                  var date = new Date(cur.date);
                  var today = new Date();
                  var toReturn = false;
                  if(date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
                    if(date.getDate() == today.getDate()){
                      if(cur.receivedStatus != "away")
                        toReturn = true;
                    }
                  }
                  // get current
                  if(cur.xpid == xpid)
                    currentVm = cur;
                  // get new
                  if (cur.contactId == id && !cur.readStatus && toReturn && cur.phone != $rootScope.meModel.primary_extension)
                    todaysVms.push(cur);
                  // get old
                  if (cur.contactId == id && !cur.readStatus && cur.phone != $rootScope.meModel.primary_extension)
                    oldVms.push(cur);
                }
                break;
              case 'group':
                var group = groupService.getGroup(id);
                if (group){
                  for (var j = 0; j < group.members.length; j++){
                    groupVms.push(allVms.filter(function(item){
                      return ( (item.contactId == group.members[j].contactId) && !item.readStatus);
                    }));
                  }
                }
                todaysVms = oldVms = groupVms;
                break;
              default:
                todaysVms = oldVms = allVms;
                break;
            }

             if(todaysVms.length < 1){
              notification.label = 'you have ' + oldVms.length + ' unread voicemail(s)';
                // remove from today
                for (var i = 0, len = $scope.todaysNotifications.length; i < len; i++){
                  if ($scope.todaysNotifications[i].xpid == notification.xpid) {
                    $scope.todaysNotifications.splice(i,1);
                    break;
                  }
                }     
             } else{
                notification.label = 'you have ' +  todaysVms.length + ' new voicemail(s)';
             }

            // if displayname is a phone number -> add the hypens to make external notifications consistent...
            if (notification.fullProfile == null && notification.displayName.split('').length == 10 && !isNaN(parseInt(notification.displayName)))
              notification.displayName = notification.displayName.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

         });         
        break;
      case 'chat':
        notification.label = 'chat message';
        break;
      case 'missed-call':
        notification.label = 'missed call';
        notification.message="... you have a missed call";
        break;
      case 'busy-ring-back':
        notification.displayName = notification.fullProfile.displayName;
        notification.label = 'is now available for call';
        notification.message= "User is free for call";
        break; 
      case 'description':
        notification.label = "chat message";
        notification.message = "<strong>Goodbye " + notification.data.groupId + "!</strong><br />" + notification.message;
        break;
      case 'wall':
        notification.label = "share";
        break;
      case 'error':
        notification.displayName = 'Error';
        notification.message = 'Open for Details';
        break;
      case 'zoom':
        notification.label = "zoom";
        break;
      case 'barge message':
        notification.label = "You are being barged by";
    }

    if(notification.audience == "conference"){
      var xpid = notification.context.split(':')[1];
      var conference = conferenceService.getConference(xpid);
      notification.conference = conference;
    }

  };

  $scope.cleanGroupDeleteMsg = function(str){
    return $sce.trustAsHtml(str);
  };


  $scope.checkIfGroup = function(msg){
    if (msg != undefined && msg.audience == 'group'){
      // display group avatar rather than individual
      var groupId = msg.context.split(':')[1];
      var ourGroup = groupService.getGroup(groupId);
      return ourGroup;
    } else if (msg != undefined && msg.audience == 'queue'){
      // display queue avatar rather than individual avatar
      if (msg.context)
        var queueId = msg.context.split(':')[1];
      else
        var queueId = msg.queueId;
      var ourQueue = queueService.getQueue(queueId);
      return ourQueue;
    } else {
      return msg.fullProfile;
    }
  };

  $scope.$on('$routeChangeSuccess', function(event,data){
    for (var i = 0, iLen = $scope.notifications.length; i < iLen; i++){
      var singleMsg = $scope.notifications[i];
      if (singleMsg != undefined){
        switch(singleMsg.audience){
          case 'group':
            if (singleMsg.context && singleMsg.type == 'gchat'){
              var groupNoteId = singleMsg.context.split(':')[1];
              if (data.params.route == 'chat' && data.params.groupId == groupNoteId)
                $scope.remove_notification(singleMsg.xpid);
            }
            break;
          case 'queue':
            if (singleMsg.context){
              var queueNoteId = singleMsg.context.split(':')[1];
              switch(singleMsg.type){
                case 'gchat':
                  if (data.params.route == 'chat' && data.params.queueId == queueNoteId)
                    $scope.remove_notification(singleMsg.xpid);              
                  break;
                case 'q-broadcast':
                  if (data.params.route == 'alerts' && data.params.queueId == queueNoteId)
                    $scope.remove_notification(singleMsg.xpid);
                  break;
              }
            }
            break;
          case 'contact':
            if (singleMsg.context && singleMsg.type == 'chat'){
              var contactNoteId = singleMsg.context.split(':')[1];
              if (data.params.route == 'chat' && data.params.contactId == contactNoteId)
                $scope.remove_notification(singleMsg.xpid);
            }
            break;
        }
      }
    }
  });

  $scope.$on('delete_long_wait', function(event, data){
    deleteLastLongWaitNotification();
  });

  var favicon = new Favico({
    animation: 'none',
    bgColor: '#27AD12',
    fontFamily: 'Arial',
    fontStyle: 'normal',
    type: 'rectangle',
    pposition: 'down',
    textColor: '#FFFFFF'
  });

  var isIE = false;
  var isSafari = false;

  if (isBrowserIE()){
    // determine if IE
    isIE = true;
  }

  var agent = navigator.userAgent.toLowerCase();
  if(agent.indexOf('safari') != -1 && agent.indexOf('chrome') == -1){
    // determine if Safari
    isSafari = true;
  }

  $scope.$watch('todaysNotifications.length', function(newNotificationCount){
    if (isIE || isSafari){
      // if IE or Safari - just use a simple counter on title of browser tab
      if (newNotificationCount === 0)
        document.title = 'Fonality HUDWeb';
      else 
        document.title = '(' + newNotificationCount + ') ' + 'Fonality HUDWeb';
    } else {
      // otherwise if Chrome/FF -> call favicon with updated notification #
      if (newNotificationCount > 0){
        favicon.badge(newNotificationCount);
      } else if (newNotificationCount === 0){
        // or use original favicon if no new notifications
        var replacement = document.getElementById('originalFavicon');
        favicon.image(replacement);
      }
    }
  });

  $scope.$on('quickinbox_synced', function(event,data){
  	if(data){
			data.sort(function(a,b){
				return b.time - a.time;
			});
      
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var isNotificationAdded = false;
				var notification = data[i];
				var has_new_content =  false;
				
				if(notification.xef001type != "delete" && notification.type != 'error'){
					notification.fullProfile = contactService.getContact(notification.senderId);
					notification.label == '';
					if(notification.audience == 'queue' && notification.type == 'q-alert-abandoned')
					{	
						//workaround: get the queue display name from the queue service
						var queue = queueService.getQueue(notification.queueId);
			    		notification.displayName = queue.name;
					}
					updateNotificationLabel(notification);

					for(var j = 0, jLen = $scope.notifications.length; j < jLen; j++){
						if($scope.notifications[j].xpid == notification.xpid){
							if(notification.xef001iver != $scope.notifications[j].xef001iver)
								has_new_content = true;
							$scope.notifications.splice(j,1,notification);
							isNotificationAdded = true;
							break;	
						}
						if($scope.notifications[j].audience == 'queue')
						{																															
							if($scope.notifications[j].type == 'q-alert-abandoned')
							{	
									var QueueNotificationsAb = settingsService.getSetting('HUDw_QueueNotificationsAb_' + $scope.notifications[j].queueId);
																						
									if(typeof QueueNotificationsAb == 'undefined' || !QueueNotificationsAb)										
										$scope.notifications.splice(j,1);										
							}
							if($scope.notifications[j].type == 'q-alert-rotation')
							{
								 	var QueueNotificationsLW = settingsService.getSetting('HUDw_QueueNotificationsLW_'+ $scope.notifications[j].queueId);
									
									if(typeof QueueNotificationsLW == 'undefined' || !QueueNotificationsLW)
										$scope.notifications.splice(j,1);	
									
									if(typeof QueueNotificationsLW1 == 'undefined' || !QueueNotificationsLW1)
									{
										isNotificationAdded = true;
										has_new_content = false;
									}	
							}
							
						    if(notification.type == 'q-alert-abandoned')
						    {
						    		var QueueNotificationsAb1 = settingsService.getSetting('HUDw_QueueNotificationsAb_' + notification.queueId);
						    		
						    		if(typeof QueueNotificationsAb1 == 'undefined' || !QueueNotificationsAb1)
									{	
										isNotificationAdded = true;
										has_new_content = false;
									}	
						    }
						    if(notification.type == 'q-alert-rotation')
							{		
									var QueueNotificationsLW1 = settingsService.getSetting('HUDw_QueueNotificationsLW_'+ notification.queueId);
																							
									if(typeof QueueNotificationsLW1 == 'undefined' || !QueueNotificationsLW1)
									{
										isNotificationAdded = true;
										has_new_content = false;
									}	
							}
									
						}
						
					}
					
					if(!isNotificationAdded || has_new_content){	
						$scope.hasNewNotifications = true;
						if(!has_new_content)
							$scope.notifications.push(notification);
						addTodaysNotifications(notification);
					}
					//addTodaysNotifications(notification);

				}
				else if(notification.xef001type == "delete"){					
                    if (notification.xpid == pbxErrorId) {
                        // remove pbxtra error
                        pbxErrorId = null;
                        $rootScope.pbxError = false;
                        $scope.dismissError('networkError');
                    }
					
					if (long_waiting_calls[notification.xpid]){
						deleteLastLongWaitNotification();
						long_waiting_calls[notification.xpid] = undefined;
					} 
					else {
						deleteNotification(notification);
					}
				}
				else if (notification.type == 'error') {
                    // add pbxtra error
                    pbxErrorId = notification.xpid;
                    $rootScope.pbxError = true;
                    $scope.addError('networkError');
				}
			}
			$scope.notifications.sort(function(a, b){
				return b.time - a.time;
			});

			nservice.notifications = $scope.notifications;
		}
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
    
    //todo remove this later this is a hack to decide when to display alerts when changing windows
    $rootScope.currentNotificationLength = $scope.todaysNotifications.length;
  });		
}]);
