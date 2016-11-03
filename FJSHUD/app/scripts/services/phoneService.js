hudweb.service('PhoneService', ['$q', '$timeout', '$rootScope', 'HttpService','$compile','$location','SettingsService', 'StorageService','GroupService','ContactService','NotificationService','$routeParams','NtpService',
	function($q, $timeout, $rootScope, httpService,$compile,$location,settingsService, storageService,groupService,contactService,nservice,$routeParams,ntpService) {

	var top_window = window.top;
	var version;
	var deferred = $q.defer();
	var deferredVM = $q.defer();
	var deferredCalls = $q.defer();
	var deferredLocations = $q.defer();
	var devices = [];
	var stayHidden = false;
	var session;
	var context = {};
	var alertPlugin;
	var phone;
	var notificationCache = {};
	var soundManager;

	var sipCalls = {};
	var tabInFocus = true;
	var callsDetails = {};
	$rootScope.meModel = {};
	var isAlertShown = false;

	var locations = {};
	var activityChecker;
	var lastActivityCheck = 0;
	var statusTimeout;

	var soundEstablished = false;


	var weblauncher = {};
	var alertPosition = {};
	var showCallAlerts = true;
	alertPosition.x = 0;
	alertPosition.y = 0;

	var voicemails = [];

	 var CALL_STATUS_UNKNOWN = "-1";
     var CALL_STATUS_RINGING = "0";
     var CALL_STATUS_ACCEPTED = "1";
     var CALL_STATUS_HOLD = "4";
     var CALL_STATUS_CLOSED = "2";
     var CALL_STATUS_ERROR = "3";
     $rootScope.callState = {};
     $rootScope.volume = {};
     $rootScope.callState = fjs.CONFIG.CALL_STATES;          
     $rootScope.calltype = fjs.CONFIG.CALL_TYPES;
     $rootScope.bargetype = fjs.CONFIG.BARGE_TYPE;
     
    var REG_STATUS_UNKNOWN = -1;
	var REG_STATUS_OFFLINE = 0;
	var REG_STATUS_ONLINE = 1;

	var extensionId = "olhajlifokjhmabjgdhdmhcghabggmdp";


	browser_on_focus = true;


	//get the browser onFocus flag
	this.getBrowserOnFocus = function()
	{
		return browser_on_focus;
	}

	this.getDeferredCalls = function(){
		return deferredCalls.promise;
	};

	this.isDocumentHidden  = function(isForceHidden){
		clearInterval(activityChecker);
		var alertDuration = settingsService.getSetting('alert_call_duration');

		var hidden;
		if(document.hidden || !isForceHidden){//) && !isAlertShown
			tabInFocus = false;
	

			if (session) {
				activityChecker = setInterval(function() {
					// check if user is active outside of hudweb
					if (session.getLastUserActivity() < lastActivityCheck) {
						httpService.sendAction('useractivity', 'reportActivity', {});
						lastActivityCheck = 0;
					}
					else
						lastActivityCheck = session.getLastUserActivity();
				}, fjs.CONFIG.ACTIVITY_DELAY);
			}
		}else{
			tabInFocus = true;
			if(settingsService.getSetting('hudmw_show_alerts_always') != "true"){
				//if the new notification service is running it will dismiss the incoming call
					for(var detail in callsDetails){
						nservice.dismiss('INCOMING_CALL',detail);
					}
			}
		}
	};

	//display or hide alert on browser focus change
	var displayHideAlert = function(focused)
	{
		browser_on_focus = focused;

	};
	
	//attach the events to the window
	if(document.attachEvent){
		document.attachEvent("onVisibilitychange",context.isDocumentHidden);
		//attach events to the browser
		if(top_window == window.self)
		{	
			top_window.attachEvent("onFocus",function(){	
				displayHideAlert(true);				
			});
			top_window.attachEvent("onBlur",function(){		
				displayHideAlert(false);				
			});
		}
	}else{
		document.addEventListener("visibilitychange", context.isDocumentHidden, false);
		//attach events to the browser
		if(top_window == window.self)
		{	
			top_window.addEventListener("focus", function(){	
				displayHideAlert(true);								
			}, false);
			top_window.addEventListener("blur", function(){	
				displayHideAlert(false);									
			}, false);			
		}	
	}


    var isInFocus = function(){
      return tabInFocus;
    };

    this.isInFocus = isInFocus;


	var formatData = function(event) {
		// format data that controller needs
		return {
			mycalls: callsDetails,
			devices: devices,
			event:event
			//totals: totals
		};
	};

	this.getMyCalls = function(){
		return deferred.promise;
	};

  var reportActivity = function() {
    httpService.sendAction('useractivity', 'reportActivity', {});
  };

	var hangUp = function(xpid){
		httpService.sendAction('mycalls','hangup',{mycallId:xpid});
	};

	var holdCall = function(xpid, isHeld){
		if (isHeld){
			httpService.sendAction('mycalls', 'transferToHold', {mycallId: xpid});
		} else {
			httpService.sendAction('mycalls', 'transferFromHold', {
				mycallId: xpid,
				toContactId: $rootScope.meModel.my_pid
			});
		}
	};


	var makeCall = function(number){
		number = number.replace(/\D+/g, '');
		var call_already_in_progress = false;
		// if there is a call in progress already (callsDetails is NOT empty obj)...
		if(!$.isEmptyObject(callsDetails))
		{
			for(var cd in callsDetails)	
			{
				// if trying to call the same person a 2nd time...
				if(callsDetails[cd].phone == number)
				{							
						call_already_in_progress = true;
				} else {
					// if user is calling a 2nd (or 3rd) person, place 1st person (or 2nd person) on hold... (warm transfer functionality takes advantage of this)
					this.holdCalls();
				}
			}	
		}
		// if no call already in progress AKA if this is the 1st call
		if(!call_already_in_progress) {	
			httpService.sendAction('me', 'callTo', {phoneNumber: number});
		}  
  };

	var acceptCall = function(xpid){
		httpService.sendAction('mycalls', 'answer',{mycallId:xpid});
		for(var i in callsDetails){
			if(i != xpid && callsDetails[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
				holdCall(i,true);
			}
		}
	};

	var addonActivateTab = function() {
            if(!context.addonProxyElement) {
                context.addonProxyElement = document.createElement("MyExtensionDataElement");
                context.addonProxyElement.setAttribute("url", location.href);
                document.documentElement.appendChild(context.addonProxyElement);
            }
            var evt = document.createEvent("Events");
            evt.initEvent("MyExtensionEvent", true, false);
            context.addonProxyElement.dispatchEvent(evt);
     };
     //we are using this to cache the previous notification section
	this.cacheNotification = function(content,width,height){
		notificationCache.html = content;
		notificationCache.height = height;
		notificationCache.width = width;
	};



	//these function will run through the settings for regular alerts and determine whether or not the alert should display
	this.shouldAlertDisplay = function(){
		var display_Notification = false;

		if(settingsService.getSetting('alert_show') == 'true'){
			if($rootScope.meModel.chat_status == 'busy' || $rootScope.meModel.chat_status == "dnd"){
				if(settingsService.getSetting('hudmw_show_alerts_in_busy_mode') == 'true'){
					if(settingsService.getSetting('hudmw_show_alerts_always') == 'true'){
						display_Notification = true;
					}else{
						if(document.visibilityState == "hidden" || document.hidden || !document.hasFocus()){
								display_Notification = true;
						}
						else
						{
							display_Notification = false;
						}
					}
				}else{
					display_Notification = false;
				}
			}else{
				if(settingsService.getSetting('hudmw_show_alerts_always') == 'true'){
					display_Notification = true;
				}else{
					if(document.visibilityState == "hidden" || document.hidden || !document.hasFocus()){
							display_Notification = true;
					}
					else{
						display_Notification = false;
					}
				}
			}

		}

		return display_Notification;
	};


	//this will display either HTML 5 notifications or the new webphone notifications (Chrome)
	var displayWebphoneNotification = function(data,type, isNative){
		var display_Notification = context.shouldAlertDisplay();
		if(display_Notification){
			if(isNative){
				isAlertShown = true;
				nservice.sendData(data,0,type);
			}else{
				if(document.getElementById("AppLoading") == null)
				 nservice.displayWebNotification(data);
			}
		}
	};

	//Call back used for the old alert
	var onCallStateChanged = function(call){
		status = parseInt(call.status);
        var data = {};
        sipCalls[call.sip_id] = call;

		switch(status){
			case CALL_STATUS_RINGING:
				data = {
					event: 'ringing',
				};
				break;
			case CALL_STATUS_ACCEPTED:
				data = {
					event: 'accepted',
				};
				break;
			case CALL_STATUS_HOLD:
				data = {
					event: 'onhold'
				};

				break;
			case CALL_STATUS_ERROR:
				removeNotification();
				break;
			case CALL_STATUS_UNKNOWN:
				removeNotification();
				break;
			case CALL_STATUS_CLOSED:
				data = {
					event: 'onclose',
					sipId: call.sip_id
				};
				removeNotification();
				break;
		}



        if(!$.isEmptyObject(data)){
          $rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
		}
	};


	onNetworkStatus = function(st){
   	};


    var onLocationChanged = function(x,y){
    	alertPosition.x = x;
    	alertPosition.y = y;
    };


    var activateBrowserTab = function(tabId){

    	switch($rootScope.browser){
    		case "MSIE":
    			session.activateIE("#/");
				break;
    		case "Chrome":
    			addonActivateTab();
				session.activateChrome("#/");
				addonActivateTab();
				break;
    		case "Safari":
    			session.activateSafari("#/");
				break;
    		case "Firefox":
    			addonActivateTab();
				session.activateFirefox("#/");
				addonActivateTab();

				break;
    	}
    };

    var onAlert = function(urlhash){
    	var arguments,url,query,queryArray,id,data,xpid;
    	arguments = urlhash.split("?");
    	//we need to decode the uri because the plugin will sometimes return an html encoded string
    	url = decodeURI(arguments[0].replace("#",''));

    	if(arguments.length > 1){
	    	query = arguments[1];
	    }
    	if(query){
			queryArray = query.split('&');
			xpid = queryArray[0];
    	}

		// use 'return' instead of 'break' if we don't need to re-focus tab
    	switch(url){
	    		case '/CancelCall':
	    			hangUp(xpid);
	    			return;
	    		case '/EndCall':
	    			hangUp(xpid);
	    			removeNotification();
					return;
	    		case '/HoldCall':
	    			holdCall(xpid,true);
	    			return;
	    		case '/ResumeCall':
	    			data = {
	    				event: 'resume'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					holdCall(xpid,false);
	    			return;
	    		case '/AcceptCall':
					acceptCall(xpid);
					if(settingsService.getSetting('alert_call_duration') == "while_ringing"){
						removeNotification();
	    			}else if(settingsService.getSetting('hudmw_show_alerts_always') != "true"){
	    				if(!document.hidden){
							remove_notification();
						}
	    			}
					return;
	    		case '/AcceptZoom':
					var apiUrl = queryArray[1].split(': ')[1];
					
					// brief delay so window can re-focus
					setTimeout(function() {
						window.open(apiUrl,'_blank');
					}, 100);
					
					remove_notification(xpid);
					break;
	    		case '/RejectZoom':
	    			removeNotification();
	    			return;
	    		case '/OpenNotifications':
	    			data = {
	    				event:'openNot'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					break;
				case '/CallBack':
					makeCall(xpid);
					return;
				case '/contact':
					$location.path('/contact/'+xpid);
					$location.replace();
					
					removeNotification();
					break;
				case '/RemoveNotification':
				    remove_notification(xpid);
					return;
				case '/goToChat':
					var context = queryArray[0];
					// var audience = context.split(":")[0];
					var xpid = context.split(":")[1];
					var messagexpid = queryArray[1];
					var messagetype = queryArray[2];
					var queueId = queryArray[3];
					var audience = queryArray[4];
					var vmId = queryArray[5];

					if (messagetype == 'q-alert-rotation' || messagetype == 'q-alert-abandoned')
						showQueue(queueId, audience, messagetype, messagexpid);
					else 
						goToNotificationChat(xpid, audience, messagexpid, messagetype, vmId);

					break;
				case '/callAndRemove':
					var phone = queryArray[1];
					makeCall(phone); 
					remove_notification(xpid); 
					return;	
				case '/showCallControlls':
					showCurrentCallControls(xpid);
					break;
				case '/showQueue':
					var context = queryArray[0];
					xpid = context.split(':')[1];
					var queueId = queryArray[0];
					var type = queryArray[2];
					var messagexpid = queryArray[3];
					var audience = queryArray[1];

					showQueue(queueId,audience, type,messagexpid);
					break;
				case '/CloseError':
					var data = {
						event: 'dismissError',
						type: xpid
					};
					
					$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					return;
				case '/HandleError':
					var el = document.getElementById('error-' + xpid);
					
					// use notification click handler
					if (el)
						el.click();
					
					el = null;
					break;
		}

		// re-focus tab/window
		if (url.indexOf('"ts"') === -1) {
			activateBrowserTab();
			window.focus();
		}
    };
	
	var removeNotification = function(){
		if(alertPlugin){

			alertPlugin.removeAlert();
			//isAlertShown = false;
		}
	};

	var remove_notification = function(xpid){
		httpService.sendAction('quickinbox','remove',{'pid':xpid});
		httpService.deleteFromWorker('quickinbox', xpid);
	};

	var goToNotificationChat = function(xpid, audience,mxpid, mtype, vmId){

		switch(audience){
			case 'contacts':
				audience = "contact";
				break;
			case 'groups':
				audience = "group";
				break;
			case 'queues':
				audience = "queue";
				break;
			case 'conferences':
				audience = "conference";
				break;
		}
		
		if (mtype == 'vm' && vmId) {
			// check if already on tab
			if ($location.path() == '/calllog/voicemails')
				$rootScope.$broadcast('vmToOpen', vmId);
			else {
				$rootScope.vmToOpen = vmId;
				$location.path('/calllog/voicemails');
			}
		}
		else if (audience == 'queue' && mtype == 'q-broadcast')
			$location.path("/" + audience + "/" + xpid + "/alerts");
		else
			$location.path("/" + audience + "/" + xpid + "/chat");
		
		remove_notification(mxpid);

	};

	var storeRecent = function(xpid){
		var localPid = JSON.parse(localStorage.me);
		var recent = JSON.parse(localStorage['recents_of_' + localPid]);
		// are all notifications sent from a contact? can they be sent via a group/queue/conf? if so, need to adjust the type...
		recent[xpid] = {
			type: 'contact',
			time: new Date().getTime()
		};
		localStorage['recents_of_' + localPid] = JSON.stringify(recent);
		$rootScope.$broadcast('recentAdded', {id: xpid, type: 'contact', time: new Date().getTime()});
	};

	var showCurrentCallControls = function(currentCall){
		$location.path("settings/callid/"+currentCall);
	};

	var showQueue = function(qid, audience, type,messagexpid)
    {

		$('.Widget.Queues .WidgetTabBarButton').removeClass('fj-selected-item');

		if(type == 'q-alert-abandoned')
		{
			$location.path("/" + audience + "/" + qid + "/stats");
		}
		else
		{
			if(type == 'q-alert-rotation')
			{
			   $location.path("/" + audience + "/" + qid + "/calls");

			}
		}
		$rootScope.$broadcast('delete_long_wait', messagexpid);
		remove_notification(messagexpid);
    };

    var onAlertMouseEvent = function(event,x,y){
    };


    var setupListeners = function(){

    	if(phone){
    		if(phone.attachEvent){
				phone.attachEvent("onCall", onCallStateChanged);
                phone.attachEvent("onStatus", accStatus);
    		}else{
    			phone.addEventListener("Call",onCallStateChanged);
    			phone.addEventListener("Status",accStatus);
    		}
    	}

    	if(alertPlugin){
    		if(alertPlugin.attachEvent){
    			alertPlugin.attachEvent("onAlert",onAlert);
    			alertPlugin.attachEvent("ononAlertMouseEvent",onAlertMouseEvent);
    			alertPlugin.attachEvent("ononLocationChanged", onLocationChanged);
    		}else{
    			alertPlugin.addEventListener("Alert",onAlert,false);
    			alertPlugin.addEventListener("onAlertMouseEvent",onAlertMouseEvent,false);
    			alertPlugin.addEventListener("onLocationChanged", onLocationChanged,false);

    		}
    	}

    };

	var isEnabled = function(permission, bit) {
		return ((permission & (1 << bit)) == 0);
	};

	this.displayWebphoneNotification = displayWebphoneNotification;


	this.removeNotification = removeNotification;

	this.getSoundManager = function(){
		if(soundManager){
			return soundManager;
		}else{
			return undefined;
		}
	};

	//this method updates the audio device 
	//starting with webphone 1.1.011769 we will need to store the deviceIds in localstorage
	//unfortunately if the user clears the cache it will default to the first device in the user list.

  this.reportActivity = reportActivity;
	this.hangUp = hangUp;
	this.holdCall = holdCall;
	this.acceptCall = acceptCall;

	this.transfer = function(xpid,number){
		httpService.sendAction('mycalls', 'transferTo', {mycallId: xpid, toNumber: number});
	};

	//look for audio tag and play sound based on key
	this.playSound = function(sound_key){
		if (settingsService.getSetting('hudmw_chat_sounds') == "true"){
			var audio;
			
			switch(sound_key){
				case 'received':
					if($rootScope.meModel.chat_status != "dnd"){
						if(settingsService.getSetting('hudmw_chat_sound_received') ==  "true"){
							audio = new Audio('res/audio/received.mp3');
							audio.play();
						}
					}
					
					break;
				case 'sent':
					if(settingsService.getSetting('hudmw_chat_sound_sent') ==  "true"){
						audio = new Audio('res/audio/sent.mp3');
						audio.play();
					}
					
					break;
			}
			
			audio = null;
		}
	};

	this.holdCalls = function(){
		for(var callId in callsDetails){
			if (callsDetails[callId].state != fjs.CONFIG.CALL_STATES.CALL_HOLD){
				holdCall(callId,true);
			}
		}
	};

	/*this returns the call object provided by the phone plugin which gives you control over the call such
	holding the call resuming the call and ending the call
	*/
	this.getCall = function(xpid){
		var call;
		if(callsDetails[xpid]){
			call = sipCalls[callsDetails[xpid].sipId];
		}
		return call;
	};
	/**
		this method will return meta data about a call
	*/
	this.getCallDetail = function(xpid){
		return callsDetails[xpid];
	};

	this.getCallByContactId = function(contactId){
		for(var call in callsDetails){
			if(callsDetails[call].contactId){
				if(callsDetails[call].contactId == contactId){
					return callsDetails[call];
				}
			}

		}
	};

	this.makeCall = makeCall;

	this.isAlertShown = function(){
		return isAlertShown;
	};

	this.setAlertShown = function(value){
		isAlertShown = value;
	};

	this.setStayHidden = function(value){
		stayHidden = value;
	};

	this.parkCall = function(call_id){
		httpService.sendAction('mycalls', 'transferToPark', {mycallId: call_id});
	};

	this.mute = function(callId,toMute){
		if(toMute){
			httpService.sendAction('mycalls','mute',{mycallId: callId});
		}else{
			httpService.sendAction('mycalls','unmute',{mycallId: callId});
		}
	};

	$rootScope.$on('voicemailbox_synced', function(event, data) {
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			var match = false;

			for (var v = 0, vLen = voicemails.length; v < vLen; v++) {
				// find and update or delete
				if (voicemails[v].xpid == data[i].xpid) {
					if (data[i].xef001type == 'delete') {
						voicemails.splice(v, 1);
						vLen--;
					}
					else
					{	
						voicemails[v].readStatus = data[i].readStatus;
					    voicemails[v].transcription = data[i].transcription;
					}
					match = true;
					break;
				}
			}

			// don't add voicemails from myself
			if (!match && data[i].xef001type != 'delete' && data[i].phone != $rootScope.meModel.primary_vm_box && data[i].phone != $rootScope.meModel.primary_extension && data[i].phone != $rootScope.meModel.mobile) {
				data[i].fullProfile = contactService.getContact(data[i].contactId);
				voicemails.push(data[i]);
			}
		}

		deferredVM.resolve(voicemails);
	});

	this.getVm = function(){
		return deferredVM.promise;
	};

	this.parseOutHyphens = function(phoneNumber){
		phoneNumber = phoneNumber.replace(/-/g,"");
		return phoneNumber;
	};

	$rootScope.$on("mycalldetails_synced", function(event,data){
		if(data){
			for(var i = 0, iLen = data.length; i < iLen; i++){
				if (data[i].xpid)
					if(callsDetails[data[i].xpid]){
						callsDetails[data[i].xpid].details = data[i];
				}
			}
		}
	});

	var recentCalls = {};

	$rootScope.$on("mycalls_synced",function(event,data){
		if(data){
			var i = 0;
			var sip_calls_to_delete = [];

			for(var i = 0, iLen = data.length; i < iLen; i++){

				if(data[i].xef001type == "delete"){
					var call = callsDetails[data[i].xpid];
					isAlertShown = false;
					nservice.dismiss('INCOMING_CALL',data[i].xpid);

					if(call){
						//delete sipCalls[callsDetails[data[i].xpid].sipId];

						// delete call from recents obj when call ends so that no repeat additions
						if (callsDetails[data[i].xpid].contactId){
							delete recentCalls[callsDetails[data[i].xpid].contactId];
						}
						else if (callsDetails[data[i].xpid].details && callsDetails[data[i].xpid].details.conferenceId){
							delete recentCalls[callsDetails[data[i].xpid].details.conferenceId];
						}

						sip_calls_to_delete.push(callsDetails[data[i].xpid].sipId);
						delete callsDetails[data[i].xpid];

					}

				}else{
					var doesExist = false;
					//context.cancelled = false;//reset the 'cancelled' flag
					var call = callsDetails[data[i].xpid];
					if(call != undefined && (call.record || call.state == fjs.CONFIG.CALL_STATES.CALL_HOLD)){
						doesExist = true;
					}

					if(call && call.details){
						data[i].details = call.details;
					}
					data[i].location = locations[data[i].locationId];
					callsDetails[data[i].xpid] = data[i];
					callsDetails[data[i].xpid].sipCall = sipCalls[callsDetails[data[i].xpid].sipId];
					if(data[i].contactId){
						callsDetails[data[i].xpid].fullProfile =  contactService.getContact(data[i].contactId);
					}	

					// add call to recents
					if (callsDetails[data[i].xpid].contactId)
						var tempId = callsDetails[data[i].xpid].contactId;
					else if (callsDetails[data[i].xpid].details && callsDetails[data[i].xpid].details.conferenceId)
						var tempId = 	callsDetails[data[i].xpid].details.conferenceId;
					
					recentCalls[tempId] = callsDetails[data[i].xpid];

					// launch web task on final answer?
					if (data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED && weblauncher[data[i].htCallId]) {
						launchWebTask(weblauncher[data[i].htCallId]);
						delete weblauncher[data[i].htCallId];
					}
				}
				
			
			}
			//this is a hack for too address the call hold and unhold issue 
			//to properlly fix we need to redo the mappings so that it makes sense
			for(var i = 0; i < sip_calls_to_delete.length; i++){
				var callStillExists = false;
				for(var detail in callsDetails){
					if(callsDetails[detail].sipId){
						callStillExists = true;
						break;
					}
				}
				if(!callStillExists){
					delete sipCalls[sip_calls_to_delete[i]];
				}
			}
		}
		for (var key in recentCalls){
			// loop thru recentCalls object and save to recent...
			if (recentCalls[key].contactId){
				storageService.saveRecent('contact', recentCalls[key].contactId);
			}
			else if (recentCalls[key].displayName.indexOf('Conference') != -1){
				if (recentCalls[key].details)
					storageService.saveRecent('conference', recentCalls[key].details.conferenceId);
			}
		}

		deferred.resolve(formatData());
		$rootScope.$broadcast('calls_updated', callsDetails);
	});
	
	$rootScope.$on('weblauncher_task_synced', function(event, data) {		
		for (var i = 0, len = data.length; i < len; i++) {
			if (data[i].xef001type != 'delete') {
				// launch task now
				if (data[i].key.indexOf('newCall') == -1 || !settingsService.getActiveWebLauncher().launchWhenCallAnswered) {
					launchWebTask(data[i]);
				}
				// save for later
				else {
					weblauncher[data[i].key.substring(0, data[i].key.lastIndexOf(':'))] = data[i];
				}
			}
		}
	});
	
	var launchWebTask = function(task) {
		// format final url
		var url = task.url.replace(/&amp;/g, '&').replace('username=', 'username=' + $rootScope.meModel.login).replace('my_extension=', 'my_extension=' + $rootScope.meModel.primary_extension);
		
		// launch
		if (task.silent === true) {
			$.ajax(url, {});
		}
		else {
			window.open(url, "_blank");
		}
		
		// force removal to avoid repeats
		httpService.deleteFromWorker('weblauncher_task', task.xpid);
	};
	
	var storeIncomingCallToRecent = function(incomingCallerXpid){
		var localPid = JSON.parse(localStorage.me);
		var recent = JSON.parse(localStorage['recents_of_' + localPid]);
		recent[incomingCallerXpid] = {
			type: 'contact',
			time: new Date().getTime()
		};
		localStorage['recents_of_' + localPid] = JSON.stringify(recent);
		$rootScope.$broadcast('recentAdded', {id: incomingCallerXpid, type: 'contact', time: new Date().getTime()});
	};

	$rootScope.$on('notification_action', function(event,data){
		if(data.notificationEventType){
			switch(data.notificationEventType){
        case 'ACTIVITY_REPORTED':
          // Only process activity from webphone when not in focus.
          if (!browser_on_focus) {
            reportActivity();
          }
          return;
        case 'CALL_DECLINED':
					hangUp(data.notificationId);
					return;
				case 'CALL_ACCEPTED':
					// cycle thru my calls and any of the calls that aren't the current call -> place on hold
					for (call in callsDetails){
						if(call != data.notificationId){
							holdCall(call, true);
						}
					}
					// accept the current incoming call
					acceptCall(data.notificationId);
					return;
				case 'CHAT_REQUEST':
					break;
				case 'CALL_REQUEST':
					break;
				case 'CALL_ON_HOLD':
					holdCall(data.notificationId,true);
					return;
				case 'talk':
					// cycle thru all of my calls... 
					for(call in callsDetails){
						// ...all of my calls that aren't the current call and aren't already on hold -> place on hold
						if(callsDetails[call].xpid != data.notificationId && callsDetails[call].state != fjs.CONFIG.CALL_STATES.CALL_HOLD){
							holdCall(callsDetails[call].xpid, true);
						}
					}
					// take the chosen current call off of hold
					holdCall(data.notificationId,false);
					return;
			}

			focusBrowser();
		}
	});

	var focusBrowser = function(){
			if($rootScope.browser == "Chrome"){
            	chrome.runtime.sendMessage(extensionId, {"message":"selectTab", "title":document.title});
			}
			nservice.sendData({message:"focus"},0,"FOCUS");
	};


	 this.getLocationPromise = function(){
	 	return deferredLocations.promise;
	 };
	 
	 $rootScope.$on('locations_synced', function(event,data){
        if(data){
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                if(data[i].locationType != 'a'){
					// update location while preserving status
					if (locations[data[i].xpid])
						angular.extend(locations[data[i].xpid], data[i]);
					else
						locations[data[i].xpid] = data[i];
                }
            }
        }
		
        deferredLocations.resolve(locations);
    });

     $rootScope.$on('location_status_synced', function(event,data){
        if(data){
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                if (locations[data[i].xpid]){
                    locations[data[i].xpid].status = data[i];
					
                }
            }
        }

    });

	var context = this;

}]);
