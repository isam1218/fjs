hudweb.service('PhoneService', ['$q', '$timeout', '$rootScope', 'HttpService','$compile','$location','SettingsService', 'StorageService','GroupService','ContactService','NotificationService','$routeParams','NtpService',
	function($q, $timeout, $rootScope, httpService,$compile,$location,settingsService, storageService,groupService,contactService,nservice,$routeParams,ntpService) {

	var top_window = window.top;
	var pluginHtml = '<object id="fonalityPhone" border="0" width="1" type="application/x-fonalityplugin" height="1"></object>';
	var phonePlugin;
	var version;
	var deferred = $q.defer();
	var deferredVM = $q.defer();
	var deferredCalls = $q.defer();
	var deferredLocations = $q.defer();
	var deferredInputDevices = $q.defer();
	var deferredOutputDevices = $q.defer();
	var deferredPlugin = $q.defer();
	$rootScope.volume = {};
	$rootScope.volume.spkVolume = 0;
	$rootScope.volume.micVolume = 0;
	$rootScope.pluginVersion = undefined;
	$rootScope.latestVersion = fjs.CONFIG.PLUGIN_VERSION[$rootScope.platform + '_' + ($rootScope.browser == "Chrome" ? 'NEW' : 'OLD')];
	var devices = [];
	var inputDevices = [];
	var outputDevices = [];
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
	var isRegistered = false;
	var isAlertShown = false;

	var selectedDevices = {};
	var	spkVolume;
	var micVolume;
	var locations = {};
	var activityChecker;
	var lastActivityCheck = 0;

	var soundEstablished = false;
	var selectedDevices = {};
	var	spkVolume;
	var micVolume;

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

     $rootScope.callState = fjs.CONFIG.CALL_STATES;          
     $rootScope.calltype = fjs.CONFIG.CALL_TYPES;
     $rootScope.bargetype = fjs.CONFIG.BARGE_TYPE;
     
    var REG_STATUS_UNKNOWN = -1;
	var REG_STATUS_OFFLINE = 0;
	var REG_STATUS_ONLINE = 1;

	var extensionId = "olhajlifokjhmabjgdhdmhcghabggmdp";
	if($rootScope.browser != "Chrome"){
		$("body").append($compile(pluginHtml)($rootScope));
		phonePlugin = document.getElementById('fonalityPhone');
		if(phonePlugin){
			version = phonePlugin.version;
			$rootScope.pluginVersion = phonePlugin.version;
		}
	}

	//this.cancelled = false;
	browser_on_focus = true;
	var isCancelled = false;

	//set the 'cancelled' flag
	this.setCancelled = function(is_cancelled)
	{
		isCancelled = is_cancelled;
	}
	//get the 'cancelled' flag
	this.getCancelled = function()
	{
		return isCancelled ;
	}

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
			if(context.shouldAlertDisplay()){
				if(nservice.isEnabled()){
					if(!$.isEmptyObject(callsDetails)){
						for(var detail in callsDetails){
							if(alertDuration != "entire"){
				              if(callsDetails[detail].state == fjs.CONFIG.CALL_STATES.CALL_RINGING && callsDetails[detail].xef001type != 'delete'){
				            	  context.displayCallAlert(callsDetails[detail]);
				              }
				              else if(callsDetails[detail].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED)
				            	  nservice.dismiss("INCOMING_CALL",callsDetails[detail].xpid);  
				              else if (callsDetails[detail].xef001type == 'delete') 
									nservice.dismiss("INCOMING_CALL",callsDetails[detail].xpid);
					 		}
					 		else
					 		{
					 			if (callsDetails[detail].xef001type == 'delete') 
									nservice.dismiss("INCOMING_CALL",callsDetails[detail].xpid);
					 			else
					 			{
					 				if((settingsService.getSetting('alert_call_outgoing') == 'true' && !callsDetails[detail].incoming) || 
					 				   (settingsService.getSetting('alert_call_incoming') == 'true' && callsDetails[detail].incoming))
					 					context.displayCallAlert(callsDetails[detail]);
					 			}	
					 		}	
					 			
						}
					}
				}else{
					if((settingsService.getSetting('alert_call_outgoing') == 'true' && !callsDetails[detail].incoming) || 
			 		   (settingsService.getSetting('alert_call_incoming') == 'true' && callsDetails[detail].incoming))
					{	
						if(notificationCache.html && ($rootScope.currentNotificationLength > 0 || !$.isEmptyObject(callsDetails)) && isAlertShown){
							displayNotification(notificationCache.html,notificationCache.width,notificationCache.height);
						}
					}	
				}
			}

			if (session) {
				activityChecker = setInterval(function() {
					// check if user is active outside of hudweb
					if (session.getLastUserActivity() < lastActivityCheck) {
						httpService.sendAction('useractivity', 'reportActivity', {});
						lastActivityCheck = 0;
					}
					else
						lastActivityCheck = session.getLastUserActivity();
				}, 5000);
			}
		}else{
			tabInFocus = true;
			if(settingsService.getSetting('hudmw_show_alerts_always') != "true"){
				//if the new notification service is running it will dismiss the incoming call
				if(nservice.isEnabled()){
					for(var detail in callsDetails){
						nservice.dismiss('INCOMING_CALL',detail);
					}
				}else{
					removeNotification();
				}
			}
		}
	};

	//display or hide alert on browser focus change
	var displayHideAlert = function(focused)
	{
		browser_on_focus = focused;
		
		if(nservice.isEnabled()){
			isCancelled = nservice.getCancelled();
		}
		console.log("cancelled? " + isCancelled);	
		//remove if the alert was closed
		if(isCancelled)
		{
			if(nservice.isEnabled()){
				for(var detail in callsDetails){
					nservice.dismiss('INCOMING_CALL',detail);
				}
			}
			else
				removeNotification();
			
			context.isDocumentHidden(true);								
		}
		else
		{
			if(focused)
			{									
				if(settingsService.getSetting('hudmw_show_alerts_always') != 'true')
					context.isDocumentHidden(true);	
				else
					context.isDocumentHidden(false);				
			}
			else		
				context.isDocumentHidden(false);
		}
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

	//this will attempt to send the web phone actions it will attempt three times before quitting
	var messageSoftphone = function(data,retry){
		if(retry == undefined)retry = 0;
		if(context.webphone){
			if(context.webphone.readyState == 1){
				context.webphone.send(JSON.stringify(data));
			}else{
				if(retry > 3){
					setTimeout(messageSoftphone(data,retry),5000);
				}
			}
		}
	};

    var isInFocus = function(){
      return tabInFocus;
    };

    this.isInFocus = isInFocus;

	var registerPhone = function(isRegistered){
		if(context.webphone){
			messageSoftphone({a : 'reg', value : isRegistered});
		}
		if(phone){
			phone.register(isRegistered);
		}
	};


	var activatePhone = function(){
		if(settingsService.getSetting('instanceId') != localStorage.instance_id){
			registerPhone(false);
		}else{
			registerPhone(true);
		}
	};


	settingsService.getMe().then(function(data){

		if($rootScope.browser == "Chrome"){
			if(!context.webphone && $rootScope.meModel.my_pid){
				getWSVersion();
        		nservice.initNSService();
        	}
		}else{
			if(phonePlugin && $rootScope.meModel && $rootScope.meModel.my_jid){
	        var username = $rootScope.meModel.my_jid.split("@")[0];
				if(!isRegistered && phonePlugin.getSession){
					session = phonePlugin.getSession(username);
					session.authorize(localStorage.authTicket,localStorage.nodeID,fjs.CONFIG.SERVER.serverURL);

					if(session.attachEvent){
						session.attachEvent("onStatus", sessionStatus);
		                session.attachEvent("onNetworkStatus", onNetworkStatus);

				}else{
					 session.addEventListener("Status",sessionStatus, false);
	               	 session.addEventListener("NetworkStatus", onNetworkStatus);
				}
				if(session.status == 0){
				}
			}
		}
		}
	});

	var setVolume = function(volume){
		if(context.webphone){
			context.setSpeakerVolume(volume);
		}
		if(soundManager){
			soundManager.speaker = volume;
		}
	};


	var setMicSensitivity = function(sensitivity){
		if(context.webphone){
			context.setMicrophoneVolume(sensitivity);
		}
		if(soundManager){
			soundManager.microphone = sensitivity;
		}
	};

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
		var call = context.getCall(xpid);
		if(call){
			if(context.webphone){
				//messageSoftphone({a : 'hangUp', value : call.sip_id});
				httpService.sendAction('mycalls','hangup',{mycallId:xpid});
			}else{
				call.hangUp();
			}
		}else{
			httpService.sendAction('mycalls','hangup',{mycallId:xpid});
		}
	};

	var holdCall = function(xpid,isHeld){
		if(isHeld){
        	httpService.sendAction('mycalls','transferToHold',{mycallId:xpid});
		}else{
	       	httpService.sendAction('mycalls','transferFromHold',{mycallId:xpid,toContactId:$rootScope.meModel.my_pid});
		}
	};

	var makeCall = function(number){
		if(!isRegistered && $rootScope.meModel.location.locationType == 'w'){
			return;
		}
		number = number.replace(/\D+/g, '');
		var call_already_in_progress = false;
		
		if(!$.isEmptyObject(callsDetails))
		{
			for(var cd in callsDetails)	
			{
				if(callsDetails[cd].phone == number)
				{							
						call_already_in_progress = true;
				}
			}	
		}
		if(!call_already_in_progress)
		{	
	        if($rootScope.meModel.location.locationType == 'w'){
	        	if(context.webphone && number)
	        	{	
	        		messageSoftphone({a : 'call', value : number});
	        	}else if(phone && number != ""){
	        		phone.makeCall(number);
				}else{
	        		httpService.sendAction('me', 'callTo', {phoneNumber: number});
				}
			}else{
				httpService.sendAction('me', 'callTo', {phoneNumber: number});
				
			}	
		}  
    };

	var acceptCall = function(xpid){
		var call = context.getCall(xpid);
		if(call){
			if(context.webphone){
				context.webphone.send(JSON.stringify({a : 'accept', value : call.sip_id}));
			}else{
				call.accept();
			}

		}else{
			httpService.sendAction('mycalls', 'answer',{mycallId:xpid});
		}

		for(var i in callsDetails){
			if(i != xpid && callsDetails[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
				holdCall(i,true);
			}
		}
	};
	//Given an Xpid we loop through the list of voicemails and broadcast to the controller that will play the voicemail
	var playVm = function(xpid){
		for (var i = 0, iLen = voicemails.length; i < iLen; i++) {
			if (voicemails[i].xpid == xpid) {
				$rootScope.$broadcast('play_voicemail', voicemails[i]);
				voicemails[i].readStatus = true;
				break;
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

	//this method is used  for display the old Plugin (for safari,firefox and IE)
	var displayNotification = function(content, width,height){
		if(!alertPlugin){
			return;
		}
		var display_Notification = context.shouldAlertDisplay();

		context.cacheNotification(content,width,height);

		if(alertPlugin && display_Notification ){
				alertPlugin.setAlertBounds(alertPosition.x,alertPosition.y,width,height);
				alertPlugin.addAlertEx(content);
				alertPlugin.setShadow(true);
				alertPlugin.setBorderRadius(5);
				alertPlugin.setTransparency(255);
				isAlertShown = true;
		}
	};

	//this will display either HTML 5 notifications or the new webphone notifications (Chrome)
	var displayWebphoneNotification = function(data,type, isNative){
		var display_Notification = context.shouldAlertDisplay();
		if(display_Notification){
			if(isNative){
				isAlertShown = true;
				nservice.sendData(data,0,type);
			}else{
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


	//call back to verify account status of the old softphone.
   var accStatus = function(account_) {

            if (account_) {
			   if (account_.status == REG_STATUS_ONLINE) {
                    isRegistered = true;
					
					if ($rootScope.phoneError)
						$rootScope.$broadcast('network_issue', null);
                } 
				else if(account_.status == REG_STATUS_UNKNOWN){
                    isRegistered = false;
					
					// delay check in case user was simply switching devices
					$timeout(function() {
						if (!isRegistered)
							$rootScope.$evalAsync($rootScope.$broadcast('network_issue', 'phoneError'));
					}, 1000, false);
				}
				else{
                    isRegistered = false;
					
					if ($rootScope.phoneError)
						$rootScope.$broadcast('network_issue', null);
				}

				var data = {
					event:'state',
					registration: isRegistered,
				};
				$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
	      }
    };

	var onVolumeChanged = function(spkVolume,microphoneLevel){
		$rootScope.volume.spkVolume = spkVolume;
		$rootScope.volume.micVolume = microphoneLevel;
	};

	var sessionStatus = function(session_status){
		if (session_status.status == 0 && !isRegistered) {

            if(!alertPlugin && !phone){
            	alertPlugin = session.alertAPI;
				phone = session.phone;
         		var url = $location.absUrl().split("#")[0] + "views/nativealerts/Alert.html";
         		alertPlugin.initAlert(url);
				removeNotification();
         		activatePhone();
				
				setTimeout(function() {
					deferredPlugin.resolve(alertPlugin);
				}, 1000);

            //isRegistered = true;
			if(!soundEstablished){
				soundManager = session.soundManager;
				if(soundManager){
					if(soundManager.attachEvent){
						soundManager.attachEvent("onVolume", onVolumeChanged);
					}else{
						soundManager.addEventListener("Volume",onVolumeChanged,false);
					}
				}

				devices = soundManager.devs;
				inputDevices.length = 0;
				outputDevices.length = 0;

    			for(var i = 0; i < devices.length;i++){
    			  	if(devices[i].input_count > 0){
    			  		inputDevices.push(devices[i]);
    			  	}
    			  	if(devices[i].output_count > 0){
    			  		outputDevices.push(devices[i]);
    			  	}
    			}
				deferredInputDevices.resolve(inputDevices);
				deferredOutputDevices.resolve(outputDevices);



				var spkVolume = settingsService.getSetting('hudmw_webphone_speaker');
				var micVolume = settingsService.getSetting('hudmw_webphone_mic');
				$rootScope.volume.spkVolume = spkVolume;
				$rootScope.volume.micVolume = micVolume;
				if(spkVolume != undefined && micVolume != undefined && spkVolume != "" && micVolume != ""){
					soundManager.speaker = parseFloat(spkVolume);
					soundManager.microphone = parseFloat(micVolume);
			        soundEstablished = true;
			    }

			}
			setupListeners();

		}


			//registerPhone(true);

         } else if (session_status.status == 1) {
                isRegistered = false;
                return;
        } else if (session_status.status == 2) {
        	$rootScope.$broadcast('network_status',undefined);
            isRegistered = false;
            return;
        }
	};
	
	this.getPlugin = function() {
		return deferredPlugin.promise;
	};

	this.resetAlertPosition = function(){
		alertPosition.x = 0;
		alertPosition.y = 0;
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

		// re-focus tab/window
		if (url.indexOf('/Close') === -1 && url.indexOf('"ts"') === -1 && url.indexOf("/AcceptCall") === -1
			&& url.indexOf('/RemoveNotification') === -1
		) {
			activateBrowserTab();
			window.focus();
		}

    	switch(url){
	    		case '/Close':
	    			removeNotification();
	    			isCancelled = true;
					break;
	    		case '/CancelCall':
	    			hangUp(xpid);
	    			break;
	    		case '/EndCall':
	    			hangUp(xpid);
	    			removeNotification();
					break;
	    		case '/HoldCall':
	    			holdCall(xpid,true);
	    			break;
	    		case '/ResumeCall':
	    			data = {
	    				event: 'resume'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					holdCall(xpid,false);
	    			break;
	    		case '/AcceptCall':
					acceptCall(xpid);
					if(settingsService.getSetting('alert_call_duration') == "while_ringing"){
						removeNotification();
	    			}else if(settingsService.getSetting('hudmw_show_alerts_always') != "true"){
	    				if(!document.hidden){
							remove_notification();
						}
	    			}
					break;
	    		case '/AcceptZoom':
	    		var apiUrl = queryArray[1].split(': ')[1];
					window.open(apiUrl,'_blank');
					remove_notification(xpid);
					break;

	    		case '/RejectZoom':
	    			removeNotification();
	    			break;
	    		case '/OpenNotifications':
	    			data = {
	    				event:'openNot'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					break;
				case '/PlayVM':
					playVm(xpid);
					break;
				case '/CallBack':
					makeCall(xpid);
					break;
				case '/contact':
					$location.path('/contact/'+xpid);
					$location.replace();
					//$rootScope.$apply();
					removeNotification();
					break;
				case '/RemoveNotification':
				    remove_notification(xpid);
					break;
				case '/goToChat':
					var context = queryArray[0];
					// var audience = context.split(":")[0];
					var xpid = context.split(":")[1];
					var messagexpid = queryArray[1];
					var messagetype = queryArray[2];
					var queueId = queryArray[3];
					var audience = queryArray[4];

					if (messagetype == 'q-alert-rotation' || messagetype == 'q-alert-abandoned')
						showQueue(queueId, audience, messagetype, messagexpid);
					else 
						goToNotificationChat(xpid, audience, messagexpid, messagetype);

					break;
				case '/callAndRemove':
					var phone = queryArray[1];
					makeCall(phone); 
					remove_notification(xpid); 
					break;	
				case '/activatePhone':
					activatePhone();
					break;
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
					break;
				case '/HandleError':
					var el = document.getElementById('error-' + xpid);
					
					// use notification click handler
					if (el)
						el.click();
					
					el = null;
					break;
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

	var goToNotificationChat = function(xpid, audience,mxpid, mtype){

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
		if (audience == 'queue' && mtype == 'q-broadcast')
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


	var getAvatar = function(pid){
		return HttpService.get_avatar(pid,40,40);
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

    var onSoundDeviceChanged = function(data){
    	devices = soundManager.devs;
		inputDevices.splice(0,inputDevices.length);
		outputDevices.splice(0,outputDevices.length);

    	for(var i = 0; i < devices.length;i++){
    		if(devices[i].input_count > 0){
    			inputDevices.push(devices[i]);
    		}
    		if(devices[i].output_count > 0){
    			 outputDevices.push(devices[i]);
    		}
    	}

    	$rootScope.$broadcast("phone_event",{event:"updateDevices"});
    };

    var getWSVersion = function(){
    	var webphone = new WebSocket('wss://webphone.fonality.com:10443/version');
		webphone.onopen = function(e){};
		webphone.onclose = function(e){};

		webphone.onerror = function(e){};

		webphone.onmessage = function(e){
			if(e.data){
				context.version = e.data;
				$rootScope.pluginVersion = context.version;
				initWS();
				webphone.close();
			}
		};

	};

    var initWS = function(){
    	 if(context.webphone || session){
    	 	setTimeout(initWS(),5000);
    	 	return;
    	 }
    	authticket = localStorage.authTicket;
        server = fjs.CONFIG.SERVER.serverURL;
    	node = localStorage.nodeID;
    	context.webphone = new WebSocket('wss://webphone.fonality.com:10443/' + encodeURIComponent(server) + '/' + encodeURIComponent(authticket) + '/' + encodeURIComponent(node));
    	context.webphone.onopen = function(e){
    			context.setEACTailLength = function(val) {
                    if(context.webphone && val != context.getEACTailLength()) {
                    	context.webphone.send(JSON.stringify({a : 'ec', value :val}));
                    }
                };
               	context.setSpeakerVolume = function(val) {
                    if(context.webphone && context.getSpeakerVolume() != val) {
                    	context.webphone.send(JSON.stringify({a : 'soundvolume', value : parseFloat(val)}));
                    }
                };
                context.setMicrophoneVolume = function(val) {
                    if(context.webphone  && context.getMicrophoneVolume() != val) {
                    	context.webphone.send(JSON.stringify({a : 'micvolume', value :parseFloat(val)}));
                    }
                };
            	context.setInputDeviceId = function(devId) {
                	var devices = context.getDevices();
                    if(context.webphone  && context.getInputDeviceId() != devId) {
                    	if(devices.length <= devId || !devices[devId] || devices[devId].input_count <= 0)devId = -1;
                		context.webphone.send(JSON.stringify({a : 'inpdevs', value : devId}));
                    }
            	}
            	context.setOutputDeviceId = function(devId) {
                	var devices = context.getDevices();
                    if(context.webphone  && context.getOutputDeviceId() != devId) {
                    	if(devices.length <= devId || !devices[devId] || devices[devId].output_count <= 0)devId = -2;
                		context.webphone.send(JSON.stringify({a : 'outdevs', value : devId}));
                    }
            	}
            context.setRingDeviceId = function(devId) {
                var devices = context.getDevices();
                  if(context.webphone && context.getRingDeviceId() != devId) {
                    	if(devices.length <= devId || !devices[devId] || devices[devId].output_count <= 0)devId = -2;
                		context.webphone.send(JSON.stringify({a : 'ringdevs', value : devId}));
                    }
            	}

            	$rootScope.$broadcast('phone_event',{event:"enabled"});

		};
		context.webphone.onclose = function(e){
				context.webphone = false;

            	$rootScope.$broadcast('phone_event',{event:"disabled"});

				context.getSessionStatus = function() {return 0};
				context.getPhoneStatus = function() {return 5};
			    setTimeout(function(){initWS()}, 500);
    	};
		context.webphone.onerror = function(e){
			if(context.webphone)context.webphone.close();

		};
		context.webphone.onmessage = function(e){

			try
    		  {
    			  var msg = JSON.parse(e.data);

    			  if (msg.sip_id){

				  	sipCalls[msg.sip_id] = msg;
				  }

    			  if (msg.session_status!=undefined)
    			  {
      				var ss = parseInt(msg.session_status, 10);
    				context.getSessionStatus = function(){return ss};
    			  }
    			  if (msg.phone_status!=undefined)
    			  {
       				var ps = parseInt(msg.phone_status, 10);

					if(phone == undefined){
						isRegistered = ps == 1;
						data = {
							event:'state',
							registration: isRegistered,
						}
						$rootScope.$broadcast('phone_event',data);

					}

    				context.getPhoneStatus = function(){return ps};
    			  }
    			  if (msg.devices!=undefined)
    			  {
    			  		devices = msg.devices;
    			  		inputDevices.splice(0,inputDevices.length);
						outputDevices.splice(0,outputDevices.length);

    			  		for(var i = 0; i < msg.devices.length;i++){
    			  			if(msg.devices[i].input_count > 0){
    			  				inputDevices.push(msg.devices[i]);
    			  			}
    			  			if(msg.devices[i].output_count > 0){
    			  				outputDevices.push(msg.devices[i]);
    			  			}
    			  		}
						deferredInputDevices.resolve(inputDevices);
						deferredOutputDevices.resolve(outputDevices);

						if( !$rootScope.isFirstSync){
							$rootScope.$broadcast("phone_event",{event:"updateDevices"});
						}
						context.getDevices = function() {return msg.devices};
		          }
    			  if (msg.inpdevs!=undefined)
    			  {
    				var id = parseInt(msg.inpdevs, 10);
    				context.getInputDeviceId = function() {return id};
                  }
    			  if (msg.outdevs!=undefined)
    			  {
    				  var od = parseInt(msg.outdevs, 10);
    				  context.getOutputDeviceId = function() {return od};
    			  }
    			  if (msg.ringdevs!=undefined)
    			  {
    				  var rd = parseInt(msg.ringdevs, 10);
    				  context.getRingDeviceId = function() {return rd};
    			  }
    			  if (msg.micvolume!=undefined)
    			  {
    				  var mv = parseFloat(msg.micvolume);
    				  $rootScope.volume.micVolume = mv;
    				  context.getMicrophoneVolume = function() {return mv};
    			  }
    			  if (msg.soundvolume!=undefined)
    			  {
    				  var sv = parseFloat(msg.soundvolume);
    				  $rootScope.volume.spkVolume = sv;
    				  context.getSpeakerVolume = function() {return sv};
    			  }
    			  if (msg.ec!=undefined)
    			  {
    				  context.getEACTailLength = function() {return msg.ec};
    			  }
    			  if(msg.status!=undefined)thus.onCallStateChanged(msg);
    		  } catch (ex) {console.log(e.data)}
		};

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

    	if(soundManager){
    		if(soundManager.attachEvent){
    			soundManager.attachEvent('onSoundDeviceChanged',onSoundDeviceChanged);
    		}else{
    			soundManager.addEventListener('SoundDevicesChanged', onSoundDeviceChanged);
    		}
    	}
    };

	var isEnabled = function(permission, bit) {
		return ((permission & (1 << bit)) == 0);
	};

	this.displayNotification = displayNotification;
	this.displayWebphoneNotification = displayWebphoneNotification;


	this.removeNotification = removeNotification;

	this.getSoundManager = function(){
		if(soundManager){
			return soundManager;
		}else{
			return undefined;
		}
	};

	this.getSelectedDevice = function(input){
		if(context.webphone){
			switch(input){
				case 'inpdefid':
					return context.getInputDeviceId();
				case 'outdefid':
					return context.getOutputDeviceId();
				case 'ringdefid':
					return context.getRingDeviceId();
			}
		}else{
			return soundManager[input];
		}
	};

	this.setAudioDevice = function(type, value){
		switch(type){
            case 'Ring':
                if(context.webphone){
                	context.setRingDeviceId(value);
                }else{
                	soundManager.ringdefid = value;
                }
                break;
            case 'Input':
                if(context.webphone){
                	 context.setInputDeviceId(value);
               }else{
                	soundManager.inpdefid = value;
                }
                break;
            case 'Output':
                if(context.webphone){
                	context.setOutputDeviceId(value);
                }else{
                	soundManager.outdefid = value;
                }
                break;
        }
	};
  this.reportActivity = reportActivity;
	this.hangUp = hangUp;
	this.holdCall = holdCall;
	this.acceptCall = acceptCall;
	this.playVm = playVm;

	this.transfer = function(xpid,number){
		httpService.sendAction('mycalls', 'transferTo', {mycallId: xpid, toNumber: number});
	};

	this.getPhoneState = function(){
		return isRegistered;
	};

	this.getDtmfToneGenerator = function(){
		return session.getDTMFToneGenerator();
	}

	this.playTone = function(key,toPlay){
		if(toPlay){
			if(context.webphone){
				context.webphone.send(JSON.stringify({a : 'play', value : key}));
			}else{
				session.getDTMFToneGenerator().play(key);
			}

		}else{
			if(context.webphone){
				context.webphone.send(JSON.stringify({a : 'stop'}));
			}else{
				session.getDTMFToneGenerator().stop();
			}
		}
	};

	this.playTone = function(key,toPlay){
		if(toPlay){
			if(context.webphone){
				context.webphone.send(JSON.stringify({a : 'play', value : key}));
			}else{
				session.getDTMFToneGenerator().play(key);
			}

		}else{
			if(context.webphone){
				context.webphone.send(JSON.stringify({a : 'stop'}));
			}else{
				session.getDTMFToneGenerator().stop();
			}
		}
	};

	this.setVolume = setVolume;
	this.setMicSensitivity = setMicSensitivity;

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


	//this method will find the call object within the native - mycallsfeed mapping and place a dtmf call
	this.sendDtmf = function(xpid,entry){
		var call = context.getCall(xpid);
		if(call){
			if(context.webphone)
				context.webphone.send(JSON.stringify({a : 'dtmf', value : call.sip_id, digits : entry}));
			else
				call.dtmf(entry);
		}
	};
	this.holdCalls = function(){
		for(var callId in callsDetails){
			holdCall(callId,true);
		}
	};

	this.getInputDevices = function(){
		return deferredInputDevices.promise;
	};

	this.getOutputDevices = function(){
		return deferredOutputDevices.promise;
	};


	this.isPhoneActive = function(){
		return context.webphone && context.webphone.readyState == 1  ? 'new_webphone' : ( (phonePlugin && phonePlugin.getSession) ? 'old_webphone' : false);

	};
	
	this.isPluginInstalled = function() {
		return (context.webphone || (phonePlugin && phonePlugin.version));
	};

	this.getVersion = function(){
	return context.version ? context.version : (version ? version : 'undefined');
	}

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

	$rootScope.$on('voicemailbox_synced', function(event, data) {
		// first time
		if (voicemails.length == 0) {
			voicemails = data;

			// add full profile
			for (var v = 0, vLen = voicemails.length; v < vLen; v++) {
				voicemails[v].fullProfile = contactService.getContact(voicemails[v].contactId);
			}

			deferredVM.resolve(voicemails);
		}
		else {
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
							voicemails[v].readStatus = data[i].readStatus;

						match = true;
						break;
					}
				}

				if (!match && data[i].xef001type != 'delete') {
					data[i].fullProfile = contactService.getContact(data[i].contactId);
					voicemails.push(data[i]);

				}
			}
		}
	});

	this.mute = function(callId,toMute){
		if(toMute){
			httpService.sendAction('mycalls','mute',{mycallId: callId});
		}else{
			httpService.sendAction('mycalls','unmute',{mycallId: callId});
		}
	};
	this.getVm = function(){
		return deferredVM.promise;
	};

	this.getVoiceMail = function(xpid){
		for(var i = 0, iLen = voicemails.length; i < iLen ;i++){
			if(voicemails[i].xpid == xpid){
				return voicemails[i];
			}
		}
	};

	this.getVoiceMailsFor = function(id, type){
		switch(type){
			case 'contact':
				return voicemails.filter(function(data){
					return data.contactId == id && !data.readStatus && data.phone != $rootScope.meModel.primary_extension;
				});
			break;
			case 'group':
				var group = groupService.getGroup(id);
				var groupVm = [];
				if(group){
					for (var g = 0, gLen = group.members.length; g < gLen; g++) {
						groupVm.push(voicemails.filter(function(item){
							return item.contactId == group.members[g].contactId	 && !item.readStatus
						}));

					}
				}
				return groupVm;
			break;
			default:
				return voicemails;
			break;
		}
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

	$rootScope.$on("mycalls_synced",function(event,data){

		var displayHangUpLauncher = false;
		var displayLauncher = false;
		weblauncher = settingsService.getActiveWebLauncher();

		if(data){
			var i = 0;
			for(var i = 0, iLen = data.length; i < iLen; i++){

				if(data[i].xef001type == "delete"){
					var call = callsDetails[data[i].xpid];
					isAlertShown = false;
					nservice.dismiss('INCOMING_CALL',data[i].xpid);

					if(call){
						if(call.type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL && call.state != fjs.CONFIG.CALL_STATES.CALL_HOLD || call.type == fjs.CONFIG.CALL_TYPES.QUEUE_CALL){
							if(call.incoming){
								if(weblauncher.inboundHangupAuto){
										var url = weblauncher.inboundHangup;
										url = settingsService.formatWebString(url,call);
										if(weblauncher.inboundHangupSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}else{
								if(weblauncher.outboundHangupAuto){
										var url = weblauncher.outboundHangup;
										url = settingsService.formatWebString(url,call);
										if(weblauncher.outboundHangupSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}
						}
						delete sipCalls[callsDetails[data[i].xpid].sipId];
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

					if((data[i].type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL && !data[i].record) || data[i].type == fjs.CONFIG.CALL_TYPES.QUEUE_CALL){
							if(data[i].incoming){
								if(weblauncher.inboundAuto){
									if(weblauncher.launchWhenCallAnswered){
										if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
											var url = weblauncher.inbound;
											url = settingsService.formatWebString(url,data[i]);
											if(weblauncher.inboundSilent){
												$.ajax(url,{});
											}else{
												window.open(url, "_blank");
											}
										}
									}else{
										if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_RINGING){
											var url = weblauncher.inbound;
											url = settingsService.formatWebString(url,data[i]);
											if(weblauncher.inboundSilent){
												$.ajax(url,{});
											}else{
												window.open(url, "_blank");
											}
										}
									}


								}
							}else{
								if(weblauncher.outboundAuto && data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
										var url = weblauncher.outbound;
										url = settingsService.formatWebString(url,data[i]);
										if(weblauncher.outboundSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}
						}
				}
				if(settingsService.getSetting('alert_call_duration') != "entire"){
					if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_RINGING && data[i].xef001type != 'delete')
		            	  context.displayCallAlert(data[i]);
		            else if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED)
		            	nservice.dismiss("INCOMING_CALL",data[i].xpid);
		            else if (data[i].xef001type == 'delete')
		            	nservice.dismiss("INCOMING_CALL",data[i].xpid);
			    }
				else
				{
					if (data[i].xef001type == 'delete') 
						nservice.dismiss("INCOMING_CALL",data[i].xpid);
					else
						context.displayCallAlert(data[i]);
				}	
					
			}
		}
		if (data[0].incoming){
			storageService.saveRecent('contact', data[0].contactId);
		}		

		deferred.resolve(formatData());
		$rootScope.$broadcast('calls_updated', callsDetails);
	});
	this.registerPhone = registerPhone;

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
          if (! isInFocus()) {
            reportActivity();
          }
          return;
        case 'CALL_DECLINED':
					hangUp(data.notificationId);
					return;
				case 'CALL_ACCEPTED':
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
					for(call in callsDetails){
						if(call != data.notificationId){
							holdCall(call, true);
						}
					}
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

	this.displayCallAlert = function(call){
		var data = {};
	    var left_buttonText;
	    var right_buttonText;
	    var left_buttonID;
	    var right_buttonID;
	    var right_buttonEnabled;
	    var callType;

	    if(call.state == fjs.CONFIG.CALL_STATES.CALL_RINGING){
	              left_buttonText = call.incoming ? "Decline" : "Cancel";
	              right_buttonText = call.incoming && call.location.locationType != 'm' && $rootScope.meModel.location.locationType != 'm' ? "Accept" : "";
	              left_buttonID = "CALL_DECLINED";
	              right_buttonID = "CALL_ACCEPTED";
	              right_buttonEnabled = call.incoming && call.location.locationType != 'm' && $rootScope.meModel.location.locationType != 'm';
	    }else if(call.state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
          left_buttonText = "END";
          left_buttonID = "CALL_DECLINED";
          if(call.type != fjs.CONFIG.CALL_TYPES.CONFERENCE_CALL){
              right_buttonID = "CALL_ON_HOLD";
              right_buttonEnabled = true;
              right_buttonText = "HOLD";  
          }else{
              //right_buttonID = "CALL_ON_HOLD";
              right_buttonEnabled = false;
              right_buttonText = "HOLD";  
            
          }

        }else if(call.state == fjs.CONFIG.CALL_STATES.CALL_HOLD){
          right_buttonText = "TALK";
          right_buttonEnabled = true;
          right_buttonID = "talk";
        }
        if(call.type == fjs.CONFIG.CALL_TYPES.QUEUE_CALL){
          callType = "Queue";
        }else if(call.type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL){
          callType = "External";
        }else{
          callType = "Office";
        }
      

        var callStart = ntpService.calibrateNativeTime(call.created);
        var holdStart = ntpService.calibrateNativeTime(call.holdStart);

        data = {
              "notificationId": call.xpid, 
              "leftButtonText" : left_buttonText,
              "rightButtonText" : right_buttonText,
              "leftButtonId" : left_buttonID,
              "rightButtonId" : right_buttonID,
              "leftButtonEnabled" : true,
              "rightButtonEnabled" : right_buttonEnabled,
              "callerName" : call.displayName, 
              "callStatus" : call.incoming ? 'Incoming call for' : "Outbound call for",
              "callCategory" : callType,
              "muted" : call.mute ? "1" : "0",
              "record" : call.record ? "1" : "0",
            "created": callStart,
            "holdStart": holdStart
        };
        this.displayWebphoneNotification(data,"INCOMING_CALL",true);
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
					
					// update softphone status manually
                    if (locations[data[i].xpid].locationType == 'w'){
                        locations[data[i].xpid].status.deviceStatus = isRegistered ? 'r' : 'u';
                    }
                }
            }
        }

    });

	var context = this;

}]);
