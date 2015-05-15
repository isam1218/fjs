hudweb.service('NotificationService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q',
	function($q, $rootScope, httpService,$compile,$location,settingsService,$q) {
		var notifyPipe = false;
		var enabled = false;
		var initNSService = function(){
			if(notifyPipe) return;

			notifyPipe = new WebSocket('wss://webphone.fonality.com:10843');
			notifyPipe.onopen = function () {
           		
				notifyPipe.send("INIT " + JSON.stringify({
  						"sessionId" : "49393",
  						"pageTitle" : "Fonality",
  						"browser" : "Chrome",
  						"contactName" : $rootScope.meModel.display_name,
  						"contactImageUrl" : httpService.get_avatar($rootScope.meModel.my_pid,28,28,0)
  
				}));
           	
           		enabled = true;
           	};

           	notifyPipe.onmessage = function (evt) {
				var response;
            	if(evt.data == "OK"){
            		return ;
            	}else{
					response = JSON.parse(evt.data);
					console.log(response);
					$rootScope.$broadcast("notification_action",response);
            	}
            };
			
			notifyPipe.onerror = function (evt) {
            	console.error(evt);
            	notifyPipe.close();
            };
            // when the connection is closed, this method is called
           notifyPipe.onclose = function () {
            	notifyPipe = false;
            	enabled = false;
            	setTimeout(function(){initNSService()}, 500);

            }
		};
		this.initNSService = initNSService;

		this.isEnabled = function(){
			return enabled;
		};

		

		sendData =  function(data,retry,type){
			if(retry == undefined)retry = 0;
			
			if(notifyPipe){
				if(notifyPipe.readyState == 1){
					notifyPipe.send(type + " "+ JSON.stringify(data));
				}else{
					if(retry > 3){
						setTimeout(sendData(data,retry),5000);
					}
				}
			}else{

			}
		};
	
		this.dismiss = function(type,id){
			
			sendData({"notificationType":type, "notificationId":id },0,"DISMISS");	
			
		};

		this.sendData = sendData;
		




}]);