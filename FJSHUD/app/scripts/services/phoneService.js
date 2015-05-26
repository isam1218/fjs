hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q','NotificationService', function($q, $rootScope, httpService,$compile,$location,settingsService,$q,nservice) {

	$("body").append($compile('<object typemustmatch="true" id="phone" type="application/x-fonalityplugin" border="0" width="0" height="0" style="position:absolute"><param value="true" name="windowless"></object>')($rootScope));

	var phonePlugin = document.getElementById('phone');
	var version = phonePlugin.version;
	var deferred = $q.defer();
	var devices = [];
	var session;
	var context = {};
	var alertPlugin;
	var phone;
	var soundManager;
	var meModel = {};
	var sipCalls = {};
	var xpid2Sip = {};
	var tabInFocus = true;
	var callsDetails = {};
	var allCallDetails = {};
	$rootScope.meModel = {};
	var isRegistered = false;
	var isAlertShown = true;
	var selectedDevices = {};
	var	spkVolume;
	var micVolume;
	
	var voicemails = {};
	var weblauncher = {};
	var locations = {};
	//fjs.CONFIG.SERVER.serverURL 
	
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
	
	messageSoftphone = function(data,retry){
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
	
	registerPhone = function(isRegistered){
		
		messageSoftphone({a : 'reg', value : isRegistered});
		

		if(phone){
			if(phone.status != REG_STATUS_ONLINE){
				phone.register(isRegistered);
			}
		}
	};

	setVolume = function(volume){
		if(context.webphone){
			context.setSpeakerVolume(volume);
		}
		if(soundManager){
			soundManager.speaker = volume;
		}
	};

	setMicSensitivity = function(sensitivity){
		if(context.webphone){
			context.setMicrophoneVolume(sensitivity);
		}
		if(soundManager){
			soundManager.microphone = sensitivity;
		}
	};

	var formatData = function() {
		// format data that controller needs
		return {
			mycalls: callsDetails,
			devices: devices,
			//totals: totals
		};
	};
	this.getMyCalls = function(){
		return deferred.promise;
	}

	hangUp = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			if(context.webphone){
				//messageSoftphone({a : 'hangUp', value : call.sip_id});
				httpService.sendAction('mycalls','hangup',{mycallId:xpid});

			}else{
				call.hangUp();
			}
		}else{
			delete xpid2Sip[xpid];
			httpService.sendAction('mycalls','hangup',{mycallId:xpid});
		}
	};

	holdCall = function(xpid,isHeld){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			if(context.webphone){
				//messageSoftphone({a : 'hold', value : call.sip_id});
				if(isHeld){
           			httpService.sendAction('mycalls','transferToHold',{mycallId:xpid});
				}else{
           			httpService.sendAction('mycalls','transferFromHold',{mycallId:xpid,toContactId:$rootScope.meModel.my_pid});
				}
			
			}else{
				call.hold = isHeld;
			}
			
		}else{
			if(isHeld){
           		httpService.sendAction('mycalls','transferToHold',{mycallId:xpid});
			}else{
           		httpService.sendAction('mycalls','transferFromHold',{mycallId:xpid,toContactId:$rootScope.meModel.my_pid});
			}
			
		}
	};

	makeCall = function(number){
		
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
	};

	acceptCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		
		if(call){
			if(context.webphone){
				//context.webphone.send(JSON.stringify({a : 'accept', value : sip_id }));
				httpService.sendAction('mycalls', 'answer',{mycallId:xpid});
		
			}else{
				call.accept();	
			}	
		}else{
			httpService.sendAction('mycalls', 'answer',{mycallId:xpid});
		}

		for(i in callsDetails){
			if(i != xpid && callsDetails[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
				holdCall(i,true);		
			}
		}
	};

	playVm = function(xpid){
		$rootScope.$broadcast('play_voicemail',voicemails[xpid]);
	};



	this.initializePhone = function(){
		 phonePlugin = document.getElementById('phone');
		// version = phonePlugin.version;
	};

	displayNotification = function(content, width,height){
		var displayNotification = false;

		if(!alertPlugin){
			return;
		}

		if(settingsService.getSetting('alert_show') == 'true'){
			
			if(settingsService.getSetting('hudmw_show_alerts_always') == 'true'){
					displayNotification = true;	
				
			}else{
				if(document.visibilityState == "hidden"){
					displayNotification = true;	
				}		
			}


			if(settingsService.getSetting('hudmw_show_alerts_in_busy_mode') == 'true'){
				if($rootScope.meModel.chat_status == 'busy'){
					displayNotification = true;
				}else{
					displayNotification = false;
				}
			}
		}

		
			
		if(alertPlugin && displayNotification){
				alertPlugin.setAlertSize(width,height);
				alertPlugin.addAlertEx(content);
				alertPlugin.setShadow(true);
				alertPlugin.setBorderRadius(5);
				alertPlugin.setTransparency(255);
				isAlertShown = true;
		}
	};

	displayWebphoneNotification = function(data,type){
		var displayNotification = false;
		if(settingsService.getSetting('alert_show') == 'true'){
			
			if(settingsService.getSetting('hudmw_show_alerts_always') == 'true'){
					displayNotification = true;	
				
			}else{
				if(document.visibilityState == "hidden"){
					displayNotification = true;	
				}		
			}
			if(settingsService.getSetting('hudmw_show_alerts_in_busy_mode') == 'true'){
				if($rootScope.meModel.chat_status == 'busy'){
					displayNotification = true;
				}else{
					displayNotification = false;
				}
			}
		}
		
		if(displayNotification){
			nservice.sendData(data,0,type);
		}
	};

	onCallStateChanged = function(call){
		status = parseInt(call.status);
        data = {}
        sipCalls[call.sip_id] = call;
		
		switch(status){
			case CALL_STATUS_RINGING:
				data = {
					event: 'ringing',
				}
				break;
			case CALL_STATUS_ACCEPTED:
				data = {
					event: 'accepted',
				}
				break;
			case CALL_STATUS_HOLD:
				data = {
					event: 'onhold'
				}
			
				break;
			case CALL_STATUS_ERROR:
				removeNotification();
				delete sipCalls[call.sip_id];
				break;
			case CALL_STATUS_UNKNOWN:
				removeNotification();
				break;
			case CALL_STATUS_CLOSED:
				showCallControls(null);
				removeNotification();
				delete sipCalls[call.sip_id];
				break;
		}
		
		  
        
        if(!$.isEmptyObject(data)){
          $rootScope.$broadcast('phone_event',data);
		}
	};

    accStatus = function(account_) {

            if (account_) {
			   if (account_.status == REG_STATUS_ONLINE) {
                     isRegistered = true;
                } else {
                     isRegistered = false;
				}

				data = {
					event:'state',
					registration: isRegistered,
				}
				$rootScope.$broadcast('phone_event',data);
	
            }
    };
    showCallControls = function(call){
    	$rootScope.$broadcast("current_call_control", call);
	};

	sessionStatus = function(session_status){
		if (session_status.status == 0 && !isRegistered) {
            ("Session ready");
            
            if(!alertPlugin && !phone){
            	alertPlugin = session.alertAPI;
				phone = session.phone;
         		var url = $location.absUrl().split("#")[0] + "views/nativealerts/Alert.html"
         		alertPlugin.initAlert(url);
				removeNotification();
         		setupListeners();
			 }
            //isRegistered = true;
			soundManager = session.soundManager;
			devices = soundManager.devs;
			deferred.resolve(formatData());
			spkVolume = settingsService.getSetting('hudmw_webphone_speaker');
			micVolume = settingsService.getSetting('hudmw_webphone_mic');
			if(spkVolume != undefined && micVolume != undefined && spkVolume != "" && micVolume != ""){
				soundManager.speaker = parseFloat(spkVolume);
				soundManager.microphone = parseFloat(micVolume);
			}
			registerPhone(true);
			
         } else if (session_status.status == 1) {
                isRegistered = false;
                return;
        } else if (session_status.status == 2) {
            isRegistered = false;
        }
	};



	onNetworkStatus = function(st){
    };



    activateBrowserTab = function(tabId){

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

    onAlert = function(urlhash){
    	console.log("AlertClicked: " + urlhash);
    	var arguments = urlhash.split("?");
    	var url = arguments[0];
    	var xpid = arguments[1];
    	
    	activateBrowserTab();
    	
    	window.focus();
    	if($rootScope.isIE){

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
	    			}
	    			$rootScope.$broadcast('phone_event',data);
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
	    			}
	    			$rootScope.$broadcast('phone_event',data);
					break;
				case '/PlayVM':
					$rootScope.$broadcast('play_voicemail',voicemails[xpid]);
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
	    			}
	    			$rootScope.$broadcast('phone_event',data);
					holdCall(xpid,false);
	    			break;
	    		case '#/AcceptCall':
					acceptCall(xpid);
	    			break;
	    		case '#/OpenNotifications':
	    			data = {
	    				event:'openNot'
	    			}
	    			$rootScope.$broadcast('phone_event',data);
					break;
				case '#/AcceptZoom':
					window.open(xpid,'_blank');
	    			removeNotification();
	    			break;
				case '#/RejectZoom':
					removeNotification();
					break;
				case '#/PlayVM':
					$rootScope.$broadcast('play_voicemail',voicemails[xpid]);
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

	    	}
    	}
	};

	var removeNotification = function(){
		if(alertPlugin){
			isAlertShown = false;
			alertPlugin.removeAlert();
		}
	};

    var onAlertMouseEvent = function(event,x,y){
    	//this.removeNotification();
    };

    var onSoundDeviceChanged = function(event){
    }

    var getWSVersion = function(){
    	var webphone = new WebSocket('wss://webphone.fonality.com:10443/version');
		webphone.onopen = function(e){
			console.log(e);
		}
		webphone.onclose = function(e){
			console.log(e);
		}

		webphone.onerror = function(e){
			console.log(e);
		}

		webphone.onmessage = function(e){
			console.log(e);
			if(e.data){
				context.version = e.data;	
				initWS();
				webphone.close();
			}
		}
	}

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

    			  if (msg.error) alert(msg.error);
    			  
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
						deferred.resolve(formatData());
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
    				  context.getMicrophoneVolume = function() {return mv};
    			  }    				  
    			  if (msg.soundvolume!=undefined) 
    			  {
    				  var sv = parseFloat(msg.soundvolume);
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
    			phone.addEventListener("Call",onCallStateChanged,false);
    			phone.addEventListener("Status",accStatus,false)
    		}
    	}

    	if(alertPlugin){
    		if(alertPlugin.attachEvent){
    			alertPlugin.attachEvent("onAlert",onAlert);
    			alertPlugin.attachEvent("ononAlertMouseEvent",onAlertMouseEvent);
    		}else{
    			alertPlugin.addEventListener("Alert",onAlert,false);
    			alertPlugin.addEventListener("onAlertMouseEvent",onAlertMouseEvent,false);
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

	$rootScope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $rootScope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
		if(!context.webphone && $rootScope.meModel.my_pid){
			//initWS();
        	getWSVersion();
        	nservice.initNSService();
        }

        if(phonePlugin && $rootScope.meModel && $rootScope.meModel.my_jid){
        	username = $rootScope.meModel.my_jid.split("@")[0];
			if(!isRegistered && phonePlugin.getSession){
				session = phonePlugin.getSession(username);
				session.authorize(localStorage.authTicket,localStorage.nodeID,fjs.CONFIG.SERVER.serverURL);
					
				if(session.attachEvent){
					session.attachEvent("onStatus", this.sessionStatus);
	                session.attachEvent("onNetworkStatus", this.onNetworkStatus);

				}else{
					 session.addEventListener("Status",sessionStatus, false);
	               	 session.addEventListener("NetworkStatus", this.onNetworkStatus);
				}

				if(session.status == 0){
				}
			}
		}

    });

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
	
	this.hangUp = hangUp;
	this.holdCall = holdCall;
	this.acceptCall = acceptCall;
	this.playVm = playVm;

	this.transfer = function(xpid,number){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			if(context.webphone && phoneNumber){
				context.webphone.send(JSON.stringify({a : 'transfer', value : sip_id, ext: number}));
			}else{
				call.transfer(number);
			}
		}	
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

	this.setVolume = setVolume;
	this.setMicSensitivity = setMicSensitivity;

	//look for audio tag and play sound based on key
	this.playSound= function(sound_key){
		var audio = $('audio.send')

		switch(sound_key){
			case 'received':
				$("audio.received")[0].play();
				break;
			case 'sent':
				
				$("audio.send")[0].play();
				break;
		}
	};


	//this method will find the call object within the native - mycallsfeed mapping and place a dtmf call
	this.sendDtmf = function(xpid,entry){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			if(context.webphone)
				context.webphone.send(JSON.stringify({a : 'dtmf', value : sip_id, digits : entry}));
			else
				call.dtmf(entry);
		}	
	};

	this.getDevices = function(){
		return deferred.promise;	
	};

	this.isPhoneActive = function(){
		
		return context.webphone && context.webphone.readyState == 1  ? 'new_webphone' : (phonePlugin.getSession ? 'old_webphone' : false);
		/*if(context.webphone && context.webphone.readyState == 1){
			return context.getPhoneStatus() == 1; 	
		}
		if(phonePlugin.getSession){
			return true;
		}else{
			return false;
		}*/
	};

	this.getVersion = function(){
		return context.version ? context.version : (version ? version : 'undefined');
	}

	/*this returns the call object provided by the phone plugin which gives you control over the call such 
	holding the call resuming the call and ending the call
	*/
	this.getCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		return call;
	};
	/**
		this method will return meta data about a call 
	*/
	this.getCallDetail = function(xpid){
		return callsDetails[xpid];
	};

	this.getCallByContactId = function(contactId){
		for(call in callsDetails){
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
		
		for(i = 0; i < data.length; i ++){
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
		for(voicemail in data){
			voicemails[data[voicemail].xpid]  = data[voicemail];
		}
		return;
	});

	$rootScope.$on("parkedcalls_synced",function(event,data){
		$rootScope.$broadcast('parkedcalls_updated', data);
	});

	
	
	$rootScope.$on("mycalls_synced",function(event,data){
		
		var displayHangUpLauncher = false;
		var displayLauncher = false;
		weblauncher = settingsService.getActiveWebLauncher();
			
		if(data){
			var i = 0;
			for(i = 0; i < data.length; i ++){
				if(data[i].xef001type == "delete"){
					var call = callsDetails[data[i].xpid];
					nservice.dismiss('INCOMING_CALL',data[i].xpid);

					if(call){
						
						if(call.type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL){
							if(call.incoming){
								if(weblauncher.inboundHangupAuto){
										url = weblauncher.inboundHangup;
										url = settingsService.formatWebString(url,call);
										if(weblauncher.inboundHangupSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}else{
								if(weblauncher.outboundHangupAuto){
										url = weblauncher.outboundHangup;
										url = settingsService.formatWebString(url,call);
										if(weblauncher.outboundHangupSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}		
								}
							}
						}
						delete callsDetails[data[i].xpid];
						delete xpid2Sip[data[i].xpid];
					}

				}else{
					callsDetails[data[i].xpid] = data[i];
					if(data[i].state == fjs.CONFIG.CALL_STATES.CALL_ACCEPTED){
						if(data[i].type == fjs.CONFIG.CALL_TYPES.EXTERNAL_CALL){

							if(data[i].incoming){
								if(weblauncher.inboundAuto){
										url = weblauncher.inbound;
										url = settingsService.formatWebString(url,data[i]);
										if(weblauncher.inboundSilent){
											$.ajax(url,{});
										}else{
											window.open(url, "_blank");
										}
								}
							}else{
								if(weblauncher.outboundAuto){
										url = weblauncher.outbound;
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
					for(sipCall in sipCalls){
						var toBreak = false;
						
						if(xpid2Sip[data[i].xpid]){
							if(xpid2Sip[data[i].xpid] != sipCall){
								xpid2Sip[data[i].xpid] = sipCall;
							}
						}else{
							xpid2Sip[data[i].xpid] = sipCall;
						}

					}

				}
			}
		}

		deferred.resolve(formatData());
		$rootScope.$broadcast('calls_updated', callsDetails);
	});

	$rootScope.$on('notification_action', function(event,data){
		if(data.notificationEventType){
			switch(data.notificationEventType){
				case 'CALL_DECLINED':
					hangUp(data.notificationId);
					break;
				case 'CALL_ACCEPTED':
					acceptCall(data.notificationId);
					break;
				case 'CHAT_REQUEST':
					break;
				case 'CALL_ON_HOLD':
					//holdCall(data.notificationId,);
					break;
			}
		}
	});

	$rootScope.$on('locations_synced', function(event,data){
        if(data){
            if($.isEmptyObject(locations)){
            	for(index in data){
					locations[data[index].xpid] = data[index];
					if(data[index].xpid == $rootScope.meModel.current_location){
						$rootScope.meModel.location = data[index];
						break;	
					}
            	}	
            }

            if($rootScope.meModel){
            	$rootScope.meModel.location = locations[$rootScope.meModel.current_location];
            }
        }
    });

	$rootScope.$on("calldetails_synced",function(event,data){
		if(data){
			for(i = 0; i < data.length; i ++){
				if(callsDetails[data[i].xpid]){
					callsDetails[data[i].xpid].details = data[i];
				}
			}
		}
		$rootScope.$broadcast('calls_updated', callsDetails);

		
	});

}]);
