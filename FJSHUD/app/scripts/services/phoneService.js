hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService','$compile','$location', function($q, $rootScope, httpService,$compile,$location) {

	$("body").append($compile('<object typemustmatch="true" id="phone" type="application/x-fonalityplugin" border="0" width="0" height="0" style="position:absolute"><param value="true" name="windowless"></object>')($rootScope));

	var phonePlugin = document.getElementById('phone');
	var version = phonePlugin.version;
	var session;
	var alertPlugin;
	var phone;
	var soundManager;
	var meModel = {};
	var sipCalls = {};
	var xpid2Sip = {};
	var tabInFocus = true;
	var callsDetails = {};
	$rootScope.meModel = {};
	var isRegistered = false;
	var isAlertShown = true;
	var voicemails = {};
	//fjs.CONFIG.SERVER.serverURL 
	
	 var CALL_STATUS_UNKNOWN = "-1";
     var CALL_STATUS_RINGING = "0";
     var CALL_STATUS_ACCEPTED = "1";
     var CALL_STATUS_HOLD = "4";
     var CALL_STATUS_CLOSED = "2";
     var CALL_STATUS_ERROR = "3";


    var REG_STATUS_UNKNOWN = -1;
	var REG_STATUS_OFFLINE = 0;
	var REG_STATUS_ONLINE = 1;

	window.onfocus = function(){
		tabInFocus = true;
	}

	window.onblur = function(){
		tabInFocus = false;
	}


	registerPhone = function(isRegistered){
		if(phone){
			if(phone.status != REG_STATUS_ONLINE){
				phone.register(isRegistered);
			}
		}
	}

	hangUp = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			call.hangUp();
			delete sipCalls[sip_id];
		}
	}

	holdCall = function(xpid,isHeld){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			call.hold = isHeld;
		}
	}

	makeCall = function(phoneNumber){
		console.log("making call: " + phoneNumber)
		if(phone){
			phone.makeCall(phoneNumber)
		}
	}

	acceptCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		call.accept();	
	}

	playVm = function(xpid){
		$rootScope.$broadcast('play_voicemail',voicemails[xpid]);
	}



	this.initializePhone = function(){
		 phonePlugin = document.getElementById('phone');
		// version = phonePlugin.version;
	}

	displayNotification = function(content, width,height){
		
		if(alertPlugin && document.visibilityState == "hidden"){
			
			alertPlugin.setAlertSize(width,height);
			alertPlugin.addAlertEx(content);
			alertPlugin.setShadow(true);
			alertPlugin.setBorderRadius(5);
			alertPlugin.setTransparency(255);
			isAlertShown = true;
		}
	}

	onCallStateChanged = function(call){
		status = parseInt(call.status);
		sipCalls[call.sip_id] = call;
        data = {}
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
				break;
			case CALL_STATUS_UNKNOWN:
				removeNotification();
				break;
			case CALL_STATUS_CLOSED:
				removeNotification();
				break;
		}

		  
        
        if(!$.isEmptyObject(data)){
          $rootScope.$broadcast('phone_event',data);
		}
	}

    accStatus = function(account_) {
            if (account_) {
			   if (account_.status == REG_STATUS_ONLINE) {
                     isRegistered = true;
                } else {
                     isRegistered = false;
				}
            }
    }


	sessionStatus = function(session_status){
		if (session_status.status == 0 && !isRegistered) {
            ("Session ready");
            
            if(!alertPlugin && !phone){
            	alertPlugin = session.alertAPI;
				phone = session.phone;
         		var url = $location.absUrl().split("#")[0] + "views/nativeAlerts/Alert.html"
         		alertPlugin.initAlert(url);
				removeNotification();
         		setupListeners();
			 }
            isRegistered = true;
			soundManager = session.soundManager;
			registerPhone(true);
			
         } else if (session_status.status == 1) {
                isRegistered = false;
                return;
        } else if (session_status.status == 2) {
            isRegistered = false;
        }
	}

	onNetworkStatus = function(st){
        //console.log("Network is "+ ((st==0)?" not available":"available") +" native="+st);
    }

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
    }

    onAlert = function(urlhash){
    	console.log("AlertClicked: " + urlhash);
    	arguments = urlhash.split("?");
    	url = arguments[0];
    	xpid = arguments[1];
    	
    	activateBrowserTab();
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
	}

	removeNotification = function(){
		if(alertPlugin){
			isAlertShown = false;
			alertPlugin.removeAlert();
		}
	}

    onAlertMouseEvent = function(event,x,y){
    	//this.removeNotification();
    }

    setupListeners = function(){
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
    }

	$rootScope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }

        if(phonePlugin && meModel && meModel.my_jid){
        	username = meModel.my_jid.split("@")[0];
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


	this.removeNotification = removeNotification;

	this.getSoundManager = function(){
		if(soundManager){
			return soundManager;
		}else{
			return undefined;
		}
	}

	this.hangUp = hangUp;
	this.holdCall = holdCall;
	this.acceptCall = acceptCall;
	this.playVm = playVm;

	this.transfer = function(xpid,number){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			call.transfer(number);
		}	
	}


	this.sendDtmf = function(xpid,entry){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		if(call){
			session.getDTMFToneGenerator().setToneEnabled(true);
			session.getDTMFToneGenerator().play(entry);

			call.dtmf(entry);
		}	
	}

	this.getCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		return call;
	}


	this.makeCall = makeCall;

	this.isAlertShown = function(){
		return isAlertShown;
	}

	$rootScope.$on("calls_synced",function(event,data){
		if(data){
			for(i = 0; i < data.length; i ++){
				if(data[i].xef001type == "delete"){
					delete callsDetails[data[i].xpid];
					delete xpid2Sip[data[i].xpid];
				}else{
					callsDetails[data[i].xpid] = data[i];

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

		$rootScope.$broadcast('calls_updated', callsDetails);
	});
	
	httpService.getFeed('voicemailbox');
	
	$rootScope.$on('voicemailbox_synced', function(event, data) {
		for(voicemail in data){
			voicemails[data[voicemail].xpid]  = data[voicemail];
		}
		return;
	});

	$rootScope.$on("parkedcalls_synced",function(event,data){
		if(data){
		}

		$rootScope.$broadcast('calls_updated', callsDetails);
	});

	$rootScope.$on("mycalls_synced",function(event,data){
		if(data){
		}

		$rootScope.$broadcast('calls_updated', callsDetails);
	});

	$rootScope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $rootScope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
	});

	/*$rootScope.$on("calldetails_synced",function(event,data){
		if(data){
			for(i = 0; i < data.length; i ++){
				if(callsDetails[data[i].xpid]){
					callsDetails[data[i].xpid].details = data[i];
				}
			}
		}
		$rootScope.$broadcast('calls_updated', callsDetails);

		
	});*/

}]);