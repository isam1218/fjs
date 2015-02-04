hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {

	var phonePlugin = document.getElementById('phone');
	var version = phonePlugin.version;
	var session;
	var alert;
	var phone;
	var soundManager;
	var meModel = {};
	var sipCalls = {};
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

	this.initializePhone = function(){
		 phonePlugin = document.getElementById('phone');
		 version = phonePlugin.version;
	}

	onCallStateChanged = function(call){
		if (call.status == CALL_STATUS_RINGING || call.status == CALL_STATUS_ACCEPTED) {
                if (call.incoming) {
				alert('incoming call changed');                   
              	} else {
					sipCalls[call.sip_id] = call;
				}
        }
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




	this.displayNotification = function(url){
		if(alert){
			alert.addAlert(url);
		}
	}


	this.removeNotification = function(url){

		if(alert){
			alert.removeAlert();
		}
	}

	this.getSoundManager = function(){
		if(soundManager){
			return soundManager;
		}else{
			return undefined;
		}
	}

	this.hangUp = function(){
		if(phone){
			phone.hangUp();
		}
	}

	this.makeCall = function(phoneNumber){
		if(phone){
			phone.makeCall(phoneNumber)
		}
	}

}]);