hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService', 'StorageService','GroupService','ContactService',
	function($q, $rootScope, httpService,$compile,$location,settingsService, storageService,groupService,contactService) {

	var pluginHtml = '<object id="fonalityPhone" border="0" width="1" type="application/x-fonalityplugin" height="1"><param name="debug" value="1" /></object>';

	$("body").append($compile(pluginHtml)($rootScope));
	
	var phonePlugin = document.getElementById('fonalityPhone');
	var version = phonePlugin.version;
	var deferred = $q.defer();
	var deferredVM = $q.defer();
	$rootScope.volume = {};
	var devices = [];
	var session;
	var alertPlugin;
	var phone;
	var soundManager;
	var meModel = {};
	var sipCalls = {};
	var tabInFocus = true;
	var callsDetails = {};
	var allCallDetails = {};
	$rootScope.meModel = {};
	$rootScope.bargeObj = {};
	var isRegistered = false;
	var isAlertShown = true;
	var soundEstablished = false;

	var weblauncher = {};
	var alertPosition = {};
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

     $rootScope.callState.CALL_UNKNOWN = -1;
     $rootScope.callState.CALL_RINGING = 0;
     $rootScope.callState.CALL_ACCEPTED = 2;
     $rootScope.callState.CALL_HOLD = 3;


    var REG_STATUS_UNKNOWN = -1;
	var REG_STATUS_OFFLINE = 0;
	var REG_STATUS_ONLINE = 1;
	
	

	window.onfocus = function(){
		tabInFocus = true;
	};

	window.onblur = function(){
		tabInFocus = false;
	};


	var registerPhone = function(isRegistered){
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
	});

	var setVolume = function(volume){
		if(soundManager){
			soundManager.speaker = volume;
		}
	};

	var setMicSensitivity = function(sensitivity){
		if(soundManager){
			soundManager.microphone = sensitivity;
		}
	};

	

	var hangUp = function(xpid){
		
		var call = context.getCall(xpid);

		if(call){
			call.hangUp();
		}else{
			httpService.sendAction('mycalls','hangup',{mycallId:xpid});
		}
		
	};

	var holdCall = function(xpid,isHeld){
		
		var call = context.getCall(xpid);
		if(call){
			call.hold = isHeld;
		}else{
			if(isHeld){
           		httpService.sendAction('mycalls','transferToHold',{mycallId:xpid});
			}else{
	           	httpService.sendAction('mycalls','transferFromHold',{mycallId:xpid,toContactId:$rootScope.meModel.my_pid});
			}	
		}
		
	};

	var makeCall = function(number){
		if(!isRegistered && $rootScope.meModel.location.locationType == 'w'){
			return;
		}
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
				
	};

	var acceptCall = function(xpid){

		var call = context.getCall(xpid);
		if(call){
			call.accept();
		}else{
			httpService.sendAction('mycalls', 'answer',{mycallId:xpid});
		}
	
		for(var i in callsDetails){
			if(i != xpid && callsDetails[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
				holdCall(i,true);		
			}
		}
	};

	var playVm = function(xpid){
		for (var i = 0, iLen = voicemails.length; i < iLen; i++) {
			if (voicemails[i].xpid == xpid) {
				$rootScope.$broadcast('play_voicemail', voicemails[i]);
				break;
			}
		}
	};

	var displayNotification = function(content, width,height){
		
		var displayNotification = false;
		if(!alertPlugin){
			return;
		}

		if(settingsService.getSetting('alert_show') == 'true'){
			
			if(settingsService.getSetting('hudmw_show_alerts_always') == 'true'){
					displayNotification = true;	
				
			}else{
				if(!tabInFocus){
						displayNotification = true;	
				
				}
				if(document.visibilityState == "hidden"){
						displayNotification = true;	

				}		
			}

			if($rootScope.meModel.chat_status == 'busy' || $rootScope.meModel.chat_status == "dnd"){
				if(settingsService.getSetting('hudmw_show_alerts_in_busy_mode') == 'true'){
					displayNotification = true;
				}else{
					displayNotification = false;
				}
			}
		}
		

			
	if(alertPlugin && displayNotification){

				alertPlugin.setAlertBounds(alertPosition.x,alertPosition.y,width,height);
				alertPlugin.addAlertEx(content);
				alertPlugin.setShadow(true);
				alertPlugin.setBorderRadius(5);
				alertPlugin.setTransparency(255);
				isAlertShown = true;
		}
	};

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

   var accStatus = function(account_) {

            if (account_) {
			   if (account_.status == REG_STATUS_ONLINE) {
                     isRegistered = true;
                	$rootScope.phoneError = false;
                     
                } else if(account_.status == REG_STATUS_UNKNOWN){
                  	 $rootScope.phoneError = true;
                     isRegistered = false;
					 if($rootScope.isFirstSync){
					 	$rootScope.$evalAsync($rootScope.$broadcast('network_issue',data));
	     			 }
		 
				}else{
					$rootScope.phoneError = false;
                    isRegistered = false;
				}

				var data = {
					event:'state',
					registration: isRegistered,
				};
				$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
	      }
    };
   var showCallControls = function(call){
    	$rootScope.$broadcast("current_call_control", call);
	};

	var sessionStatus = function(session_status){
		if (session_status.status == 0 && !isRegistered) {
            
            if(!alertPlugin && !phone){
            	alertPlugin = session.alertAPI;
				phone = session.phone;
         		var url = $location.absUrl().split("#")[0] + "views/nativealerts/Alert.html";
         		alertPlugin.initAlert(url);
				removeNotification();
         		setupListeners();
				activatePhone();

			 	
			 }
            //isRegistered = true;
			if(!soundEstablished){
				soundManager = session.soundManager;
				devices = soundManager.devs;
				deferred.resolve(devices);
				var spkVolume = settingsService.getSetting('hudmw_webphone_speaker');
				var micVolume = settingsService.getSetting('hudmw_webphone_mic');
				if(spkVolume != undefined && micVolume != undefined && spkVolume != "" && micVolume != ""){
					soundManager.speaker = parseFloat(spkVolume);
					soundManager.microphone = parseFloat(micVolume);
					soundEstablished = true;
				}
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

	onNetworkStatus = function(st){
        //console.log("Network is "+ ((st==0)?" not available":"available") +" native="+st);
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
    			session.activateChrome("#/");
				break;
    		case "Safari":
    			session.activateSafari("#/");
				break;
    		case "FireFox":
    			session.activateFirefox("#/");
				break;
    	}
    };

    var onAlert = function(urlhash){
    	var arguments,url,query,queryArray,id,data,xpid;
    	arguments = urlhash.split("?");
    	url = arguments[0];
    	if(arguments.length > 1){
	    	query = arguments[1];
	    }	
    	if(query){
			queryArray = query.split('&');
			xpid = queryArray[0];
    	}
		
		// re-focus tab/window
		if (url.indexOf('/Close') === -1 && url.indexOf('"ts\"') === -1) {
			activateBrowserTab();
			window.focus();
		}		
		
    	if(url.indexOf('#') === -1){

			switch(url){
	    		case '/Close':
	    			removeNotification();
	    			break;
	    		case '/CancelCall':
	    			hangUp(xpid);
	    			break;
	    		case '/EndCall':
	    			hangUp(xpid);
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
	    			break;
	    		case '/AcceptZoom':
					window.open(xpid,'_blank');
	    			removeNotification();
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
					var audience = context.split(":")[0];
					xpid = context.split(":")[1];
					var messagexpid = queryArray[1];
					goToNotificationChat(xpid, audience,messagexpid); 
					break;	
				case '/callAndRemove':
					var phone = queryArray[1];
					makeCall(phone); 
					remove_notification(xpid); 
					break;	
				case '/getPlugins':
					showOverlay(true,'DownloadPlugin',{});
					window.open(xpid,'_blank');
					break;	
				case '/activatePhone':
					activatePhone();
					break;	
				case '/showCallControlls':
					showCurrentCallControls(xpid);
					break;
				case '/showQueue':
					var queueId = queryArray[0];
					var audience = queryArray[1];
					var type = queryArray[2];
					var messagexpid = queryArray[3];
					showQueue(queueId,audience, type,messagexpid);
					break;
			}
    	}else{
    		switch(url){
	    		case '#/Close':
	    			removeNotification();
	    			break;
	    		case '#/CancelCall':
	    			hangUp(xpid);
	    			break;
	    		case '#/EndCall':
	    			hangUp(xpid);
	    			break;
	    		case '#/HoldCall':
	    			holdCall(xpid,true);
	    			break;
	    		case '#/ResumeCall':
	    			data = {
	    				event: 'resume'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					holdCall(xpid,false);
	    			break;
	    		case '#/AcceptCall':
					acceptCall(xpid);
	    			break;
	    		case '#/OpenNotifications':
	    			data = {
	    				event:'openNot'
	    			};
	    			$rootScope.$evalAsync($rootScope.$broadcast('phone_event',data));
					break;
				case '#/AcceptZoom':
					window.open(xpid,'_blank');
	    			removeNotification();
	    			break;
				case '#/RejectZoom':
					removeNotification();
					break;
				case '#/PlayVM':
					playVm(xpid);
					break;
				case '#/CallBack':
					makeCall(xpid);
					break;
				case '#/contact':
					$location.path('/contact/'+xpid);
					$location.replace();
					//$rootScope.$apply();
					removeNotification();
					break;
				case '#/RemoveNotification':
				    remove_notification(xpid);
					break;	
				case '#/goToChat':
					var context = queryArray[0];
					var audience = context.split(":")[0];
					xpid = context.split(":")[1];
					var messagexpid = queryArray[1];
					goToNotificationChat(xpid, audience,messagexpid); 
					break;	
				case '#/callAndRemove':
					var phone = queryArray[1];
					makeCall(phone); 
					remove_notification(xpid); 
					break;	
				case '#/getPlugins':
					showOverlay(true,'DownloadPlugin',{});
					window.open(xpid,'_blank');
					break;	
				case '#/activatePhone':
					activatePhone();
					break;
				case '#/showCallControlls':
					showCurrentCallControls(xpid);
					break;
				case '#/showQueue':
					var queueId = queryArray[0];
					var audience = queryArray[1];
					var type = queryArray[2];
					var messagexpid = queryArray[3];
					showQueue(queueId,audience, type,messagexpid);
					
					break;
	    	}
    	}
	};

	var removeNotification = function(){
		if(alertPlugin){
			isAlertShown = false;
			alertPlugin.removeAlert();
		}
	};
	
	var remove_notification = function(xpid){		
		httpService.sendAction('quickinbox','remove',{'pid':xpid});
		//$rootScope.$broadcast('quickinbox_synced', data);
	};
	
	var goToNotificationChat = function(xpid, audience,mxpid){		
		
		switch(audience){
			case 'contacts':
				audience = "contact";
				break;
			case 'groups':
				audience = "group";
				break;
		}

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
		remove_notification(messagexpid);
    };	
	
    var onAlertMouseEvent = function(event,x,y){
    	//this.removeNotification();
    };

    var onSoundDeviceChanged = function(event){
    	console.log(event);
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


	this.removeNotification = removeNotification;

	this.getSoundManager = function(){
		if(soundManager){
			return soundManager;
		}else{
			return undefined;
		}
	};

	this.hangUp = hangUp;
	this.holdCall = holdCall;
	this.acceptCall = acceptCall;
	this.playVm = playVm;

	this.transfer = function(xpid,number){
		var call = getCall(xpid);
		if(call){
			call.transfer(number);
		}	
	};

	this.getPhoneState = function(){
		return isRegistered;
	};

	this.getDtmfToneGenerator = function(){
		return session.getDTMFToneGenerator();
	};

	this.setVolume = setVolume;
	this.setMicSensitivity = setMicSensitivity;

	this.playSound= function(sound_key){
		var audio = $('audio.send')

		if(settingsService.getSetting('hudmw_chat_sounds') == "true"){
			switch(sound_key){
				case 'received':
					if(settingsService.getSetting('hudmw_chat_sound_received') ==  "true"){
						$("audio.received")[0].play();
					}
					break;
				case 'sent':
					if(settingsService.getSetting('hudmw_chat_sound_sent') ==  "true"){
						$("audio.send")[0].play();
					}
					break;
			}
		}
	};

	this.sendDtmf = function(xpid,entry){
		var call = context.getCal(xpid);
		if(call){
			call.dtmf(entry);
		}	
	};

	this.getDevices = function(){
		return deferred.promise;	
	};

	this.isPhoneActive = function(){
		if(phonePlugin.getSession){
			return true;
		}else{
			return false;
		}
	};
	/*this returns the call object provided by the phone plugin which gives you control over the call such 
	holding the call resuming the call and ending the call
	*/
	this.getCall = function(xpid){
		var call = sipCalls[callsDetails[xpid].sipId];
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

	this.showCallControls = showCallControls;

	this.makeCall = makeCall;

	this.isAlertShown = function(){
		return isAlertShown;
	};
	
	this.parkCall = function(call_id){
		httpService.sendAction('mycalls', 'transferToPark', {mycallId: call_id});
	};

	$rootScope.$on("calls_synced",function(event,data){
		var displayHangUpLauncher = false;
		var displayLauncher = false;
		
		for(var i = 0, iLen = data.length; i < iLen; i++){
				if(data[i].xef001type == "delete"){
					if(allCallDetails[data[i].xpid]){
						delete allCallDetails[data[i].xpid];
					}
				}else{
					allCallDetails[data[i].xpid] = data[i];
				}
		}
		$rootScope.$broadcast('all_calls_updated', allCallDetails);
	});
	
	httpService.getFeed('voicemailbox');
	
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

		deferredVM.resolve(voicemails);
	});

	this.getVm = function(){
		return deferredVM.promise;
	};
	
	this.getVoiceMail = function(xpid){
		for(var i = 0; iLen = voicemails.length; i < iLen;i++){
			if(voicemails[i].xpid == xpid){
				return voicemails[i];
			}
		}
	};
	this.getVoiceMailsFor = function(id, type){
		switch(type){
			case 'contact':
				return voicemails.filter(function(data){
					return data.contactId == id && !data.readStatus;
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
	
	$rootScope.$on("mycalls_synced",function(event,data){
		
		var displayHangUpLauncher = false;
		var displayLauncher = false;
		weblauncher = settingsService.getActiveWebLauncher();
			
		if(data){
			var i = 0;
			for(var i = 0, iLen = data.length; i < iLen; i++){
					
				if(data[i].xef001type == "delete"){
					var call = callsDetails[data[i].xpid];
				
					if(call){
						
						if(call.type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL && call.state != fjs.CONFIG.CALL_STATES.CALL_HOLD){
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

					var call = callsDetails[data[i].xpid];
					if(call != undefined && (call.record || call.state == fjs.CONFIG.CALL_STATES.CALL_HOLD)){
						doesExist = true;
					}

					callsDetails[data[i].xpid] = data[i];
					if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
						
						if(!doesExist){
							for(var callId in callsDetails){
								if(callId != data[i].xpid){
									holdCall(callId,true);		
								}
							}
						}

						if(data[i].type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL && !data[i].record && !doesExist){

							if(data[i].incoming){
								if(weblauncher.inboundAuto){
										var url = weblauncher.inbound;
										url = settingsService.formatWebString(url,data[i]);
										if(weblauncher.inboundSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}else{
								if(weblauncher.outboundAuto){
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
				}
			}
		}
		if (data[0].incoming){
			storageService.saveRecent('contact', data[0].contactId);
		}
		
		$rootScope.$broadcast('calls_updated', callsDetails);
	});
	this.registerPhone = registerPhone;	

	$rootScope.$on("calldetails_synced",function(event,data){
		if(data){
			for(var i = 0, iLen = data.length; i < iLen; i++){
				if (data[i].xpid)
					$rootScope.bargeObj[data[i].xpid] = isEnabled(data[i].permissions, 1);
				if(callsDetails[data[i].xpid]){
					callsDetails[data[i].xpid].details = data[i];
				}
			}
		}		
	});

	var context = this;

}]);
