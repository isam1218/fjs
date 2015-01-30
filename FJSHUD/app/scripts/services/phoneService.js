hudweb.service('PhoneService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {

	var phonePlugin = document.getElementById('phone');
	var version = phonePlugin.version;
	var session;
	var alert;
	var meModel = {};
	//fjs.CONFIG.SERVER.serverURL 
	
	this.initializePhone = function(){
		 phonePlugin = document.getElementById('phone');
		 version = phonePlugin.version;
	}

	sessionStatus = function(session_status){
		if (session_status.status == 0) {
            ("Session ready");
            alert = session.alertAPI;
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


	$rootScope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }

        if(phonePlugin){
        	username = meModel.my_jid.split("@")[0];
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
				alert = session.alertAPI;		
			}
		}

    });



	this.displayNotification = function(url){
		if(alert){
			alert.addAlertEx(url);
		}
	}


	this.removeNotification = function(url){

		if(alert){
			alert.removeAlert();
		}
	}

}]);