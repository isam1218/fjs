hudweb.service('HttpService', ['$http', '$rootScope', '$location', '$q', '$timeout', 'NtpService', function($http, $rootScope, $location, $q, $timeout, ntpService){
	/**
		Detect Current Browser
	*/
	var ua = navigator.userAgent;
	var browser = ua.match(/(edge|chrome|safari|firefox|msie)/i);
	// if not found, default to IE mode
	browser = browser && browser[0] ? browser[0] : "MSIE";
	var isSWSupport = browser == "Chrome" || browser == "Firefox";
	var isIE = browser == "MSIE";
	var synced = false;
	var workerStarted = false;
	var appVersion = navigator.appVersion;
	var upload_progress = 0;
	var upload_taskId = 0;
	var feeds = fjs.CONFIG.FEEDS;
	var deferred_progress = $q.defer();
    var VERSIONS_PATH = "/v1/versions";
    var VERSIONSCACHE_PATH = "/v1/versionscache";
	var worker = undefined;

	if(localStorage.serverHost != undefined){
		fjs.CONFIG.SERVER.serverURL = localStorage.serverHost;
	}
	
	$rootScope.platform = appVersion.indexOf("Win") != -1 ? "WINDOWS" : (appVersion.indexOf("Mac") != -1 ? 'MAC' : 'UNKNOWN');
	$rootScope.browser = browser;
	$rootScope.isIE = isIE;
	$rootScope.isFirstSync = true;
	
	// check for second tab before starting web worker
	if (document.cookie.indexOf('tab=') == -1) {		
		worker = new Worker("scripts/workers/fdpWebWorker.js");
		
		worker.addEventListener("message", function(event) {
		    switch (event.data.action) {
		        case "init":
					workerStarted = true;
					
		        	updateSettings('instanceId','update',localStorage.instance_id); 

		            worker.postMessage({
		                "action": "sync"
		            });
		            break;
		        case "sync_completed":
		            if (event.data.data) {
		                broadcastSyncData(event.data.data);
						synced = true;
						
						if ($rootScope.networkError)
							$rootScope.$broadcast('network_issue', {show: false});
		            }
		            break;
		        case "feed_request":
		            $rootScope.$evalAsync($rootScope.$broadcast(event.data.feed + '_synced', event.data.data));
		            break;
      			case "auth_failed":
					localStorage.removeItem("me");
					localStorage.removeItem("nodeID");
					localStorage.removeItem("authTicket");
					attemptLogin();
      				break;
      			case "network_error":
      				if(!synced){
      					$rootScope.$broadcast('network_issue', {show: true});
						worker.terminate();
					}
      				break;
				case "timestamp_created":
					if (event.data.data)
						ntpService.syncTime(event.data.data);
					
					break;
			}
		}, false);
		
		
		worker.onerror = function(evt){
			console.log("error with shared worker port");
			console.log("Line #" + evt.lineno + " - " + evt.message + " in " + evt.filename);
		};
	}
	else {
		window.location.href = $location.absUrl().split("#")[0] + "views/second-tab.html";
		return;
	}

	var broadcastSyncData = function(data) {
		if (data) {
			// send data to other controllers
			$rootScope.$evalAsync(function() {
				// loop through feeds in order, according to properties.js
				for (var i = 0, ilen = feeds.length; i < ilen; i++){
					if (data[feeds[i]] && data[feeds[i]].length > 0){
						$rootScope.$broadcast(feeds[i] + '_synced', data[feeds[i]]);
					}
				}
				$rootScope.isFirstSync = false;
			});
		}
	};
	
	// send first message to shared worker
	var authorizeWorker = function() {
	    var events = {
	        "action": "authorized",
	        "data": {
	            "node": nodeID,
	            "auth": "auth=" + authTicket,
	            "serverURL":fjs.CONFIG.SERVER.serverURL
	        }

	    };

	    worker.postMessage(events);
	};
	
	// fail catch if app hasn't loaded
	$timeout(function() {
		if (!workerStarted) {
			localStorage.removeItem("nodeID");
			attemptLogin();
		}
	}, 40000, false);
	
	/**
		AUTHORIZATION
	*/
	var authTicket = '';
	var nodeID = '';
	
	var attemptLogin = function() {
        var authURL = fjs.CONFIG.SERVER.loginURL
            + '/oauth/authorize'
            + "?response_type=token"
            + "&redirect_uri=" + encodeURIComponent(location.href)
            + "&display=page"
            + "&client_id=web.hud.fonality.com"
            + "&instance_id=" + localStorage.instance_id
            + "&lang=eng"
            + "&revoke_token="; // + authTicket;
			
		document.cookie = "tab=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			
		window.onbeforeunload = null;
		location.href = authURL;
	};
	
	// get instance_id token
	if (/instance_id/ig.test(location.href)) {
		instance_id = location.href.match(/instance_id=([^&]+)/)[1];
		localStorage.instance_id = instance_id;
	}

	// get authorization token
	if (/access_token/ig.test(location.href)) {
		authTicket = location.href.match(/access_token=([^&]+)/)[1];
		localStorage.authTicket = authTicket;
		$location.hash('');
	}
	else if (localStorage.authTicket === undefined)
		attemptLogin();
	else
		authTicket = localStorage.authTicket;
		
	// get node id
	var clientRegistry = function(){
			$http({
				url:fjs.CONFIG.SERVER.serverURL 
				+ '/accounts/ClientRegistry?t=web&node=&Authorization=' 
				+ authTicket,
				headers:{
					'Content-Type':'application/x-www-form-urlencoded'
				},
				data:'',
				method:'POST'
			})
			.success(function(response) {
				var nodes = response.match(/node=([^\n]+)/);
				if(nodes && nodes.length > 0){
					nodeID = nodes[1];
					localStorage.nodeID = nodeID;
				}else{
					localStorage.serverHost = response.match(/RedirectHost=([^\n]+)/)[1];
					fjs.CONFIG.SERVER.serverURL = localStorage.serverHost;
					clientRegistry();			
				}
				// start shared worker
				authorizeWorker();
			})
			.error(function(response, status) {
				switch(status){
					case 403:
					case 402:
						delete localStorage.me;
						delete localStorage.nodeID;
						delete localStorage.authTicket;
						$rootScope.$broadcast('no_license', undefined);

						break;
					case 404:
					case 500:
						$rootScope.$broadcast('network_issue',undefined);
						break;
					default:
						attemptLogin();
						break;
				}
			});
	};
	/**
		SCOPE FUNCTIONS
	*/
	if (localStorage.nodeID === undefined) {
		clientRegistry();
	}else {
		nodeID = localStorage.nodeID;
		authorizeWorker();
	}

	this.logout = function() {
        var authURL = fjs.CONFIG.SERVER.loginURL
            + '/oauth/authorize'
            + "?response_type=token"
            + "&redirect_uri=" + encodeURIComponent(location.href.replace(location.hash, ''))
            + "&display=page"
            + "&client_id=web.hud.fonality.com"
            + "&lang=eng"
            + "&revoke_token=" + authTicket
            + "&instance_id=" + localStorage.instance_id;
			
		localStorage.removeItem("me");
    	localStorage.removeItem("authTicket");
    	localStorage.removeItem("nodeID");
    	localStorage.removeItem("data_obj");
    	localStorage.removeItem("instance_id");
    	localStorage.removeItem("serverHost");
		
		document.cookie = "tab=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    	
		// shut off web worker
		worker.terminate();
		
		window.onbeforeunload = null;		
		location.href = authURL;
	};
	
	this.setUnload = function() {
		document.cookie = 'tab=true; path=/';
		
		// stupid warning
		window.onbeforeunload = function() {			
			document.cookie = "tab=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			
			return "Are you sure you want to navigate away from this page?";
		};
	};

	// get feed data from web worker
    this.getFeed = function(feed) {
		if (worker) {
			worker.postMessage({
	            "action": "feed_request",
	            "feed": feed
	        });
		}
    };
    
    var updateSettings = function(type,action,model){
    	var params = {
            'a.name': type,
            't': 'web',
            'action': action
        };
		
        if (model || model == 0) {
            if (model.value) {
                params['a.value'] = model.value;
            } else {
                params['a.value'] = model;
            }
        }
    
        var requestURL = fjs.CONFIG.SERVER.serverURL + "/v1/settings";
        return $http({
            method: 'POST',
            url: requestURL,
            data: $.param(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'auth=' + authTicket,
                'node': nodeID,
            }
        });
    };
    
    this.updateSettings = updateSettings;

    this.get_avatar = function(pid,width,height,xversion){
    	if (pid)
           	return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + pid + "&w=" + width + "&h=" + height + "&Authorization=" + authTicket + "&node=" + nodeID + (xversion ? '&xver=' + xversion : '');
		else
            return "img/Generic-Avatar-Small.png";
	};
	
	this.get_audio = function(key) {
		return fjs.CONFIG.SERVER.serverURL + '/v1/' + key + '&play=1&t=web&Authorization=' + authTicket + '&node=' + nodeID;
	};
	
	this.get_smiley = function(key) {
		return fjs.CONFIG.SERVER.serverURL + '/v1/chat_smiles_download?xpid=' + key + '&Authorization=' + authTicket + '&node=' + nodeID;
	};

    this.get_attachment = function(xkeyUrl,fileName){

    	if(xkeyUrl){
    		return fjs.CONFIG.SERVER.serverURL + xkeyUrl + "&Authorization=" + authTicket + "&node=" + nodeID + "&" + fileName + '&d';
    	}
    };
	
    //this will return a promise to for file uploads
    this.get_upload_progress = function(){
    	return deferred_progress.promise;
    };

    this.upload_attachment = function(data,attachments) {
        var params = {
            'Authorization': authTicket,
            'node': nodeID,
        };
		
		// new task id
		data['a.taskId'] = '2_' + upload_taskId;
		
		var fd = new FormData();
    
        for (var field in data) {
            fd.append(field, data[field]);
        }

        for (var i in attachments){
        	fd.append('a.attachments',attachments[i]);
        }

        var requestURL = fjs.CONFIG.SERVER.serverURL + "/v1/streamevent?Authorization=" + authTicket + "&node=" + nodeID;
    	
    	var request = new XMLHttpRequest();
    	 var upload_start = true;

    	//angular http does not have a way to report progress so I switched to using xhrrequest and the new HTML5 onprogress callback
		request.upload.onprogress = function(evt){
			if(evt.lengthComputable){
				//calculate the percentage and do a notify (different from resolve since resolve only executes once)
				var percentComplete = (evt.loaded/evt.total)*100;
				var data = {
					progress:percentComplete,
					started: upload_start,
					xhr: request
				};

				deferred_progress.notify(data);
				upload_start = false;
			}	
		};
		request.addEventListener("abort", function(evt){
			var data = {
				progress: 100,
			};
			deferred_progress.notify(data);
			console.log(evt);
		},false);
		request.open("POST",requestURL, true);
		request.send(fd);
       
	    upload_taskId++;
    };

    this.update_avatar = function(data) {
        var params = {
            'Authorization': authTicket,
            'node': nodeID,
        };
    
        var fd = new FormData();
    
        for (var field in data) {
            fd.append(field, data[field]);
        }
        var requestURL = fjs.CONFIG.SERVER.serverURL + "/v1/settings?Authorization=" + authTicket + "&node=" + nodeID;
    	var upload_start = true;
        
        var request = new XMLHttpRequest();
		request.upload.onprogress = function(evt){
			if(evt.lengthComputable){
				var percentComplete = (evt.loaded/evt.total)*100;
				var data = {
					progress:percentComplete,
					started: upload_start,
					xhr:request,
				};
				deferred_progress.notify(data);
				upload_start = false;
			}	
		};

		request.addEventListener("abort", function(evt){
			var data = {
				progress: 100,
			};
			deferred_progress.notify(data);
			console.log(evt);
		},false);
		
		request.open("POST",requestURL, true);
		request.send(fd);
		
	};
	
	this.preload = function(src) {
		var img = new Image();
		img.src = src;
	};
  
	// generic 'save' function
	this.sendAction = function(feed, action, data) {
		// format request object
		var params = {
			t: 'web',
			action: action
		};
		for (var key in data)
			params['a.' + key] = data[key];
	
		return $http({
			method: 'POST',
			url: fjs.CONFIG.SERVER.serverURL + "/v1/" + feed,
			data: $.param(params),
			headers:{
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'auth='+authTicket,
				'node': nodeID,
			}
		})
		.error(function() {
			// network error
			$rootScope.$broadcast('network_issue', {show: true});
		});
	};
	
	// retrieve chat messages
	this.getChat = function(feed, type, xpid, version) {
		var deferred = $q.defer();
		
		// format request object
		var params = {
			alt: 'j',
			's.limit': 60,
			'sh.filter': '{"type":"' + type + '","key":{"feedName":"' + feed + '","xpid":"' + xpid + '"}}',
			'sh.versions': '0:0@1100000000:' + (version ? version : 0) + '@d00000000:0'
		};
	
		$http({
			method: 'POST',
			url: fjs.CONFIG.SERVER.serverURL + "/v1/history/streamevent",
			data: $.param(params),
			headers:{
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'auth='+authTicket,
				'node': nodeID,
			},
			transformResponse: false
		})
		.then(function(response) {
			var data = JSON.parse(response.data.replace(/\\'/g, "'"));
	
			for (var key in data) {
				// create xpid for each record
				for (var i = 0, iLen = data[key].items.length; i < iLen; i++)
					data[key].items[i].xpid = key + '_' + data[key].items[i].xef001id;
				
				// send items back to controller
				deferred.resolve(data[key]);
			}
		});
		
		return deferred.promise;
	};
	
	// retrieve call log history
	this.getCallLog = function(feed, xpid) {
		var deferred = $q.defer();
		
		// format request object
		var params = {
			alt: 'j',
			's.limit': 60,
			'sh.filter': '{"key":{"feedName":"' + feed + '","xpid":"' + xpid + '"},"filter_id":"' + feed + ':' + xpid + '"}',
			'sh.versions': '0:0@' + xpid.split('_')[0] + ':0'
		};
	
		$http({
			method: 'POST',
			url: fjs.CONFIG.SERVER.serverURL + "/v1/history/calllog",
			data: $.param(params),
			headers:{
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'auth='+authTicket,
				'node': nodeID,
			},
			transformResponse: false
		})
		.then(function(response) {
			
			var data = JSON.parse(response.data.replace(/\\'/g, "'"));

			for (var key in data) {
				// create xpid for each record
				for (var i = 0, iLen = data[key].items.length; i < iLen; i++)
					data[key].items[i].xpid = key + '_' + data[key].items[i].xef001id;
				
				// send items back to controller
				deferred.resolve(data[key]);
			}
		});
		
		return deferred.promise;
	};
	
	// manually override 'delete' status in web worker
	this.deleteFromWorker = function(feed, xpid) {
		if (worker) {
			worker.postMessage({
	            "action": "delete",
	            "feed": feed,
				"xpid": xpid
	        });
		}
	};

	// preload images
	this.preload('img/XAvatarBorder.png');
	this.preload('img/Generic-Error.png');
	this.preload('img/XApp-Icons.png');
	this.preload('img/XEvent.png');
	this.preload('img/XIconSet-24x24.png');
	this.preload('img/XDialog-Errors.png');
}]);
