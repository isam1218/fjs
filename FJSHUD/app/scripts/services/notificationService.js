hudweb.service('NotificationService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q', '$sce',
	function($q, $rootScope, httpService,$compile,$location,settingsService,$q,$sce) {
		this.notifications = [];
		this.errors = [];
		var notifyPipe = false;
		var enabled = false;
		var extensionId = "olhajlifokjhmabjgdhdmhcghabggmdp";
        var isCancelled = false;

		//initialize the Notification service for the new webphone notifications
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
           	
				context.setCancelled(false);
           		enabled = true;
           	};

           	notifyPipe.onmessage = function (evt) {
				var response;
            	if(evt.data == "OK"){
            		return;
            	}else{
					response = JSON.parse(evt.data);
					console.log(response);
					
					if(response.notificationEventType == 'CLOSE')
						context.setCancelled(true);
					else
						context.setCancelled(false);
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

		//set the 'cancelled' flag
		this.setCancelled = function(is_cancelled)
		{
			isCancelled = is_cancelled;
		};
		//get the 'cancelled' flag
		this.getCancelled = function()
		{
			return isCancelled ;
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
			
			if (data.fullProfile)
				iconUrl = data.fullProfile.getAvatar(64);
			else if (data.type != 'error')
				iconUrl = "img/Generic-Avatar-28.png";
			else
				iconUrl = 'img/Generic-Error.png';

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
	
	      	message = message.replace(/&lt;/g, "<" ).replace(/&gt;/g, ">");

			var notification = new Notification(data.displayName, {
				icon : iconUrl,
				body: message,
				tag : data.xpid,
			});

			var notification_data = data;

			notification.onclick = function () {
				var nd = notification_data;
				
				// error messages
				if (nd.type == 'error') {
					var el = document.getElementById('error-' + nd.xpid);
					
					// use onclick action of html element
					if (el)
						el.click();
					
					el = null;
				}
				// regular messages
				else {
					var context_data = nd.context;
					var context = context_data.split(':')[0];
					var xpid = context_data.split(':')[1];
					var route = nd.type == 'q-broadcast' ? 'alerts' : 'chat';
					
					$rootScope.$evalAsync($location.path("/" + nd.audience + "/" + xpid + "/" + route));
				}
				
				focusBrowser();
			};
			  
			notification.onclose = function () {
				var nd = notification_data;
				
				// remove notification
				if (nd.type == 'error') {
					for (var i = 0, len = context.errors.length; i < len; i++) {
						if (context.errors[i].xpid == nd.xpid) {
							context.errors.splice(i, 1);
							break;
						}
					}
				}
				else {
					httpService.sendAction('quickinbox','remove',{'pid': nd.xpid});
					httpService.deleteFromWorker('quickinbox', nd.xpid);
				}
			};

			notification.onerror = function () {
				var nt = notification;
			};

			setTimeout(function(){
				notification.onclose = null;
        		notification.close();
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