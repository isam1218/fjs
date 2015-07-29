hudweb.controller('NotificationController', 
  ['$scope', '$rootScope', 'HttpService', '$routeParams', '$location','PhoneService','ContactService','QueueService','SettingsService','ConferenceService','$timeout','NtpService','NotificationService',
  function($scope, $rootScope, myHttpService, $routeParam,$location,phoneService, contactService,queueService,settingsService,conferenceService,$timeout,ntpService,nservice){
  var playChatNotification = false;
  var displayDesktopAlert = true;
  $scope.notifications = nservice.notifications  || [];
  $scope.calls = [];
  var long_waiting_calls = {};
  var msgXpid;
  var numberOfMyCalls = 0;
  $scope.pluginErrorEnabled = true;
  $scope.inCall = false;
  $scope.inRinging = false;
  $scope.path = $location.absUrl().split("#")[0];
  $scope.messageLimit = 300;
  $scope.showNotificationBody = true;
  $scope.showHeader = false;  
  $scope.hasMessages = false;
  $scope.phoneSessionEnabled = true;
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
    
  phoneService.getDevicesPromise().then(function(data){
    $scope.phoneSessionEnabled = true;
  });

  $scope.getAvatar = function(pid){
    return myHttpService.get_avatar(pid,40,40);
  };

  $scope.disableWarning = function(){
    $scope.pluginErrorEnabled = false;
  };

  $scope.getMessage = function(message){              
    var messages = message.message && message.message != null && message.message != "" ? (message.message).split('\n') : '';
    if(messages.length == 0 || (messages.length == 1 && messages[0] == ''))
      messages="";
    
    switch(message.type){

      case "vm":
        if(message.vm && message.vm.transcription != ""){
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
        if(message.vm && message.vm.transcription != ""){
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

  $scope.acceptCall = function(xpid, message){
    for(var call in $scope.calls){
      if($scope.calls[call].state == $scope.callState.CALL_ACCEPTED){
        $scope.holdCall($scope.calls[call].xpid,true);
      }
    }
    if (message && message.type == 'zoom'){
      var urlPath = message.message.split(': ')[1];
      $scope.remove_notification(message.xpid);
      window.open(urlPath, "_blank");
      return;
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

  var createBargeNotification = function(callBarger, msgDate, msgXpid){
    var extraNotification;
    extraNotification = {
      displayName: "Call Monitoring",
      message: callBarger,
      time: msgDate,
      type: "barge message",
      xpid: msgXpid,
      label: "You are being barged by"
    };
    $scope.notifications.unshift(extraNotification);
    $scope.todaysNotifications.push(extraNotification);
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

    for (var j = 0; j < $scope.calls.length; j++){
      var singleCall = $scope.calls[j];
      if (singleCall.fullProfile && singleCall.fullProfile.call.contactId && singleCall.fullProfile.call.contactId == $rootScope.myPid){
        numberOfMyCalls = 1;
        if (singleCall.fullProfile.call.bargers.length > 0){
          var myCallBarger = singleCall.fullProfile.call.bargers[0].displayName;
          var msgDate = moment(ntpService.calibrateTime(new Date().getTime()));
          msgXpid = msgDate + '';
          // if someone barges my call, create and send me a notification on the fly
          createBargeNotification(myCallBarger, msgDate, msgXpid);
        } else if (singleCall.fullProfile.call.bargers == 0){
          // if that barger drops out, remove that notification
          $scope.remove_notification(msgXpid);
        }
      } 
    }
    
    if ($scope.calls.length == 0 && numberOfMyCalls == 1){
      numberOfMyCalls = 0;
      // if call is dropped, remove barged call notification...
      $scope.remove_notification(msgXpid);
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
						var callType;
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
						if($scope.calls[i].type == fjs.CONFIG.CALL_TYPES.QUEUE_CALL){
							callType = "Queue";
						}else if($scope.calls[i].type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL){
							callType = "External";
						}else{
							callType = "Office";
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
					  			"callCategory" : callType,
					  			"muted" : $scope.calls[i].mute ? "1" : "0",
					  			"record" : $scope.calls[i].record ? "1" : "0"
						};
						phoneService.displayWebphoneNotification(data,"INCOMING_CALL");
					}
			}else{
        $scope.displayAlert = true;
        $timeout(displayNotification, 1500);
			}
    }else{
       $scope.displayAlert = true;
      $timeout(function(){
        var element = document.getElementById("Alert");
        if(element){
          var content = element.innerHTML;
          phoneService.cacheNotification(content,element.offsetWidth,element.offsetHeight);
          
        }
        element = null;
        $scope.displayAlert = false;
        },2500);
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
			case "enabled":
				$scope.phoneSessionEnabled = true;
				break;
			case "disabled":
				$scope.phoneSessionEnabled = false;
			case 'displayNotification':
				$scope.displayAlert = true;
				$timeout(displayNotification
						, 1500);
				break;

		}
	});
  var addTodaysNotifications = function(item){
   // console.error('item - ', item);

    var context, contextId, targetId, groupContextId, queueContextId;
    var today = moment(ntpService.calibrateTime(new Date().getTime()));
    var itemDate = moment(item.time);
    var isAdded = false;

    if(item.context){
      context = item.context.split(":")[0];
      contextId = item.context.split(":")[1];

    }

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

    // if message is from today...
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
      } else if (targetId != undefined && targetId == contextId && $routeParam.route == "chat"){
        return false;

      }else{
       var dupe = false;
       var combinedMsg = false;
        for (var j = 0, jLen = $scope.todaysNotifications.length; j < jLen; j++){
               // take into account that 2 msgs in a row from the same contact are combined into 1 message
               if ((item.xef001iver != $scope.todaysNotifications[j].xef001iver) && (item.xpid == $scope.todaysNotifications[j].xpid)){
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
               if (item.type == 'wall' || item.type == 'chat' || item.type == 'gchat'){
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
               // otherwise add to todaysNotes
               $scope.todaysNotifications.push(item);
        }

        if (displayDesktopAlert){
               if ($scope.todaysNotifications.length > 0){
                       if(nservice.isEnabled()){
                          nservice.displayWebNotification(item);
                       }else{
                          $scope.displayAlert = true;
                          $timeout(displayNotification, 1500);
                       }
             }
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

  var updateNotificationLabel  = function(notification){
    var type = notification.type;
    switch(type){
      case 'q-alert-rotation':
            notification.label = $scope.verbage.long_waiting_call;
            var long_waiting_notification = angular.copy(notification);
            long_waiting_calls[notification.xpid] = notification;
        break;
      case 'q-alert-abandoned':
        notification.label = 'abandoned call';
            notification.message = "";
            var abandoned_notification = angular.copy(notification);
            // once it's an abandoned call, want long-wait-note to disappear
            deleteLastLongWaitNotification();
            $timeout(function(){deleteNotification(abandoned_notification);}, 60000);
        break;
      case 'q-broadcast':
        notification.label = 'broadcast message';
        break;
      case 'gchat':
        notification.label = "group chat to";
        break;
      case 'vm':
        var vms = phoneService.getVoiceMailsFor(notification.senderId,notification.audience);
        var vm = phoneService.getVoiceMail(notification.vmId);
        notification.vm = vm;
        notification.label = 'you have ' +  vms.length + ' new voicemail(s)';
        break;
      case 'chat':
        notification.label = 'chat message';
        break;
      case 'missed-call':
        notification.label = 'missed call';
        break;
      case 'busy-ring-back':
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
        notification.label = "You are being barged by"
    }

    if(notification.audience == "conference"){
      var xpid = notification.context.split(':')[1];
      var conference = conferenceService.getConference(xpid);
      notification.conference = conference;
    }

  };

  $scope.isPluginUptoDate = function(){
    if($rootScope.pluginVersion != undefined){
        return $rootScope.pluginVersion.localeCompare($rootScope.latestVersion) > -1;
    }else{
        return true;
    }
  }

	$scope.$on('quickinbox_synced', function(event,data){
    var displayDesktopAlert = true;
		var missedCalls = [];
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
					updateNotificationLabel(notification);
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
					updateNotificationLabel(notification);
					if(notification.xef001type != "delete"){
						$scope.notifications.push(notification);
						addTodaysNotifications(notification);
					}
				}
			}

			nservice.notifications = $scope.notifications;
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
	   }
      }				
    });		
}]);
