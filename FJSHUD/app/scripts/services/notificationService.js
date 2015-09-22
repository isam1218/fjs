hudweb.service('NotificationService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q', '$sce',
	function($q, $rootScope, httpService,$compile,$location,settingsService,$q,$sce) {
		this.notifications = [];
		var notifyPipe = false;
		var enabled = false;
		var extensionId = "olhajlifokjhmabjgdhdmhcghabggmdp";

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
            		return;
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

            };
		};
		this.initNSService = initNSService;

		this.isEnabled = function(){
			return enabled;
		};

		

	this.sendData =  function(data,retry,type){
			if(retry == undefined)retry = 0;
			
			if(notifyPipe){
				if(notifyPipe.readyState == 1){
					notifyPipe.send(type + " "+ JSON.stringify(data));
				}else{
					if(retry > 3){
						setTimeout(context.sendData(data,retry),5000);
					}
				}
			}else{

			}
		};
	
		this.dismiss = function(type,id){
			context.sendData({"notificationType":type, "notificationId":id },0,"DISMISS");	
			
		};

		this.displayWebNotification = function(data){
      if (!Notification) {
				console.log('Desktop notifications not supported');
				return;
			}
      
			if (Notification.permission !== "granted")
				Notification.requestPermission();
			
			var iconUrl;
			if(data.fullProfile){
				iconUrl = data.fullProfile.getAvatar(64);
			}else{
				iconUrl = "../img/Generic-Avatar-28.png";
			}

			var message = "";

      switch(data.type){
        case 'vm':
        case 'q-alert-abandoned':
          message = data.label;
          break;
        case 'description':
          var msgSplit = data.message.split('!</strong><br />');
          message = "Goodbye " + data.data.groupId + "! " + msgSplit[1];
          break;
        case 'barge message':
          data.displayName = data.message;
          message = data.label;
          break;
        default:
          message = data.message;
          break;
      }

      message = message.replace(/&lt;/g, "<" ).replace(/&gt;/g, ">").replace(/&amp;/g , "&");

			var notification = new Notification(data.displayName, {
				icon : iconUrl,
        body: message,
				tag : data.xpid,
			});

			var notification_data = data;

			notification.onclick = function () {
				var nt = notification;
				var nd = notification_data;
				var context_data = nd.context;
				var context = context_data.split(':')[0];
				var xpid = context_data.split(':')[1];
				var route = nd.type == 'q-broadcast' ? 'alerts' : 'chat';
				
				$rootScope.$evalAsync($location.path("/" + nd.audience + "/" + xpid + "/" + route));
				focusBrowser();
			};
			  
			notification.onclose = function () {
				var nt = notification;
			};

			notification.onerror = function () {
				var nt = notification;
			};

			setTimeout(function(){
        		notification.close()
      		}, 5000);
			
			return notification;
		};

		var focusBrowser = function(){
			if($rootScope.browser == "Chrome"){
            	chrome.runtime.sendMessage(extensionId, {"message":"selectTab", "title":document.title});
			}
			context.sendData({message:"focus"},0,"FOCUS");
		};
		context = this;
}]);