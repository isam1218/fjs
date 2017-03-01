hudweb.service('NotificationService', ['$q', '$rootScope', 'HttpService','$compile','$location','SettingsService','$q', '$sce',
	function($q, $rootScope, httpService,$compile,$location,settingsService,$q,$sce) {
		this.notifications = [];
		this.todaysNotifications = [];
		this.errors = [];
		
		var notifyPipe = false;
		var extensionId = "olhajlifokjhmabjgdhdmhcghabggmdp";

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
           	
           	};

           	notifyPipe.onmessage = function (evt) {
				var response;
            	if(evt.data == "OK"){
            		return;
            	}else{
					response = JSON.parse(evt.data);
					$rootScope.$broadcast("notification_action",response);
            	}
            };
			
			notifyPipe.onerror = function (evt) {
            	notifyPipe.close();
            };
            // when the connection is closed, this method is called
           notifyPipe.onclose = function () {
            	notifyPipe = false;
            	setTimeout(function(){initNSService()}, 500);

            };
		};

		
		this.initNSService = initNSService;		

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
			if (!("Notification" in window)) {
			    return;
			}
      
			if (Notification.permission !== "granted")
				Notification.requestPermission();
			
			var iconUrl;
			
			if (data.fullProfile) {
				// user's image
				if (data.fullProfile.icon_version) {
					iconUrl = httpService.get_avatar(data.fullProfile.xpid, 40, 40, data.fullProfile.icon_version);
				}
				// create one from scratch
				else {
					var canvas = document.createElement("canvas");
					var ctx = canvas.getContext("2d");					
					canvas.width = canvas.height = 40;

					// bg
					ctx.fillStyle = '#8DB4BD';
					ctx.fillRect(0, 0, 40, 40);

					// text
					var split = data.fullProfile.displayName.split(' ');
					var fName = split[0].charAt(0);
					var lName = '';
						
					if (split.length > 1)
						lName = split[split.length-1].charAt(0);
						
					ctx.textBaseline = 'middle';
					ctx.textAlign = 'center';
					ctx.font = '16px Arial';
					ctx.fillStyle = '#ffffff';
					ctx.fillText(fName + lName, 20, 20);
	  
					// export
					iconUrl = canvas.toDataURL();
					
					canvas = null;
				}
			}
			else if (data.type != 'error')
				iconUrl = "img/Generic-Avatar.png";
			else
				iconUrl = 'img/Generic-Error.png';

			var message = "";

			switch(data.type){
		        case 'vm':
		        message = "you have "+data.title+" new voicemail(s)";
		        	break;
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
	
	      	message = message.replace(/&lt;/g, "<" ).replace(/&gt;/g, ">").replace(/&amp;/g, '&');

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
					var route;

					switch(nd.type) {
						case 'q-broadcast':
							route = 'alerts';
							break;
						case 'vm':
							route = 'voicemails';
							
							// check if already on tab
							if ($location.path() == '/calllog/voicemails')
								$rootScope.$broadcast('vmToOpen', nd.vmId);
							else
								$rootScope.vmToOpen = nd.vmId;
								
							break;
						default:
							route = 'chat';
					}
					
					if (route == 'voicemails')
						$rootScope.$evalAsync($location.path('/calllog/voicemails'));
					else
						$rootScope.$evalAsync($location.path("/" + nd.audience + "/" + xpid + "/" + route));
				}
				
				focusBrowser();
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
		
		// native alert was clicked
		this.nativeAction = function(data) {
			var xpid = data.context.split(':')[1];
			var route = '';

			// redirect to chat
			switch(data.type) {
				case 'q-broadcast':
					route = 'alerts';
					break;
				case 'chat':
				case 'gchat':
				case 'wall':
				case 'zoom':
					route = 'chat';
					break;
			}
			
			$rootScope.$evalAsync(function() {
				$location.path("/" + data.audience + "/" + xpid + "/" + route);
			});
			
			// switch browser tab
			chrome.runtime.sendMessage(extensionId, {"message":"selectTab", "title":document.title});
		};

		var focusBrowser = function(){
			if($rootScope.browser == "Chrome"){
            	chrome.runtime.sendMessage(extensionId, {"message":"selectTab", "title":document.title});
			}
			context.sendData({message:"focus"},0,"FOCUS");
		};
		
		context = this;
}]);
