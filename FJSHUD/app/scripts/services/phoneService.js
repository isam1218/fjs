hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService','$compile', function($q, $rootScope, httpService,$compile) {

	var phonePlugin = document.getElementById('phone');
	var version = phonePlugin.version;
	var session;
	var alert;
	var phone;
	var soundManager;
	var meModel = {};
	var sipCalls = {};
	var xpid2Sip = {};
	var callsDetails = {};
	$rootScope.meModel = {};
	var isRegistered = false;
	//fjs.CONFIG.SERVER.serverURL 
	
	 var CALL_STATUS_UNKNOWN = -1;
     var CALL_STATUS_RINGING = 0;
     var CALL_STATUS_ACCEPTED = 1;
     var CALL_STATUS_HOLD = 4;
     var CALL_STATUS_CLOSED = 2;
     var CALL_STATUS_ERROR = 3;


    var REG_STATUS_UNKNOWN = -1;
	var REG_STATUS_OFFLINE = 0;
	var REG_STATUS_ONLINE = 1;

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

	this.initializePhone = function(){
		 phonePlugin = document.getElementById('phone');
		 version = phonePlugin.version;
	}

	displayNotification = function(content, width,height){
		if(alert){
			alert.setShadow(false);
			alert.setTransparency(255);
			alert.setAlertSize(width,height);
			//alert.setAlertBounds(0,0,0,0);
			alert.addAlert(content);
		}
	}

	onCallStateChanged = function(call){
		status = call.status;
		sipCalls[call.sip_id] = call;
                
		switch(status){
			case CALL_STATUS_RINGING:

			case CALL_STATUS_ACCEPTED:

		}

		  element = document.getElementById("CallAlert");
          element.style.display="block";
		  content = element.innerHTML;
       	  displayNotification(content,element.offsetWidth,element.offsetHeight);
          element.style.display="none";
    }

    accStatus = function(account_) {
            console.log("Phone status:" + account_.status);
            if (account_) {
			   if (account_.status == REG_STATUS_ONLINE) {
                     console.log("Online");

                } else if (account_.status == REG_STATUS_OFFLINE) {
                     console.log( "Offline");
                } else {
                     console.log( "Registering");
                }
            }
    }


	sessionStatus = function(session_status){
		if (session_status.status == 0) {
            ("Session ready");
            alert = session.alertAPI;
            isRegistered = true;
			phone = session.phone;
			soundManager = session.soundManager;
			registerPhone(true);
			alert.initAlert('');
			setupListeners();
         } else if (session_status.status == 1) {
                alert("Session unauthorized");
                return;
        } else if (session_status.status == 2) {
            alert("Session not permitted");
        }
	}

	onNetworkStatus = function(st){
        console.log("Network is "+ ((st==0)?" not available":"available") +" native="+st);
    }

    onAlert = function(urlhash){
    	console.log("AlertClicked: " + urlhash);
    	arguments = urlhash.split("?");
    	url = arguments[0];
    	xpid = arguments[1];

    	switch(url){
    		case '#/Close':
    			removeNotification();
    			break;
    		case '#/EndCall':
    			hangUp(xpid);
    			removeNotification();
    			break;
    	}

	}

	removeNotification = function(){

		if(alert){
			alert.removeAlert();
		}
	}

    onAlertMouseEvent = function(event,x,y){
    	console.log("MouseEvent: " + event + " (" + x + "," + y + ")");

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

    	if(alert){
    		if(alert.attachEvent){
    			alert.attachEvent("onAlert",onAlert);
    			alert.attackEvent("ononAlertMouseEvent",onAlertMouseEvent);
    		

    		}else{
    			alert.addEventListener("Alert",onAlert,false);
    			alert.addEventListener("onAlertMouseEvent",onAlertMouseEvent,false);
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

        if(phonePlugin && meModel){
        	username = meModel.my_jid.split("@")[0];
			if(!isRegistered){
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
			call.dtmf(entry);
		}	
	}

	this.getCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		return call;
	}

	this.acceptCall = function(xpid){
		sip_id = xpid2Sip[xpid];
		call = sipCalls[sip_id];
		call.accept();	
	}

	this.makeCall = function(phoneNumber){
		if(phone){
			phone.makeCall(phoneNumber)
		}
	}

	$rootScope.$on("calls_synced",function(event,data){
		if(data){
			for(i = 0; i < data.length; i ++){
				if(data[i].xef001type == "delete"){
					delete callsDetails[data[i].xpid];
					delete xpid2Sip[data[i].xpid];
				}
				callsDetails[data[i].xpid] = data[i];
				xpid2Sip[data[i].xpid] = Object.keys(sipCalls)[0];
			
			}
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