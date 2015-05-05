hudweb.service('NotificationService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q',
	function($q, $rootScope, httpService,$compile,$location,settingsService,$q) {
		var notifyPipe = false;
		var enabled = false;
		var initNSService = function(){
			if(notifyPipe) return;

			notifyPipe = new WebSocket('wss://webphone.fonality.com:10843');
			notifyPipe.onopen = function () {
           		

           	
           		enabled = true;
           	};

           	notifyPipe.onmessage = function (evt) {
            	console.error(evt);

            	if(evt.data == "OK"){
            		return ;
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

		this.sendData = function(data,retry){
			if(retry == undefined)retry = 0;
			
			if(notifyPipe){
				if(notifyPipe.readyState == 1){
					notifyPipe.send(data);
				}else{
					if(retry > 3){
						setTimeout(sendData(data,retry),5000);
					}
				}
			}else{

			}
		};



}]);