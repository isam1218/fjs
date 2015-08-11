hudweb.service('HttpService', ['$http', '$rootScope', '$location', '$q', 'NtpService', function($http, $rootScope, $location, $q, ntpService){
	/**
		Detect Current Browser
	*/
	var ua = navigator.userAgent;
	var browser = ua.match(/(edge|chrome|safari|firefox|msie)/i);
	// if not found, default to IE mode
	browser = browser && browser[0] ? browser[0] : "MSIE";
	var isSWSupport = browser == "Chrome" || browser == "Firefox";
	var isIE = browser == "MSIE";
	var isMasterTab = false;
	var tabId = 0;
	var synced = false;
	var tabMap = undefined;
	$rootScope.browser = browser;
	$rootScope.isIE = isIE;
	var appVersion = navigator.appVersion;
	$rootScope.platform = appVersion.indexOf("Win") != -1 ? "WINDOWS" : (appVersion.indexOf("Mac") != -1 ? 'MAC' : 'UNKNOWN') ;
	var upload_progress = 0;
	var upload_taskId = 0;
	var feeds = fjs.CONFIG.FEEDS;
	$rootScope.isFirstSync = true;
	var deferred_progress = $q.defer();
    var VERSIONS_PATH = "/v1/versions";
        /**
         * Versionscache servlet URL
         * @const {string}
         * @protected
         */
    var VERSIONSCACHE_PATH = "/v1/versionscache";
	
	//method that generates a random guid for the tab
	var genGuid = function(){
		return "xxx".replace(/[x]/g,function(c){
			return c == 'x' ? Math.random().toString(16).substr(2,2) : c
		});
	};

	var assignTab = function(){
		
		tabId = sessionStorage.getItem("tabId");

		if(!tabId){
			tabId = genGuid();//generate a unique tab id
			sessionStorage.setItem("tabId",tabId);
		}

		if(localStorage.fon_tabs){
			tabMap = JSON.parse(localStorage.fon_tabs);
		}

		//if the tabmap is empty or not defined in localstorage then initialize the tab map is set the current tab as the master tab
		/*if(tabMap != undefined){
			tabMap[tabId] = { 
				isMaster:false,
				isSynced:false
			}
		}else{*/
			tabMap = {};
			tabMap[tabId] = {
				isMaster: true,
				isSynced: false
			};
		//}

		localStorage.fon_tabs = JSON.stringify(tabMap);
	};

	

	var worker = undefined;
	
	if(isSWSupport){
		if (SharedWorker != 'undefined') {
		    worker = new SharedWorker("scripts/services/fdpSharedWorker.js");
		   
		    worker.port.addEventListener("message", function(event) {
		        switch (event.data.action) {
		            case "init":
		            	updateSettings('instanceId','update',localStorage.instance_id); 

		                worker.port.postMessage({
		                    "action": "sync"
		                });
		                break;
		            case "sync_completed":
		                if (event.data.data) {
		                    broadcastSyncData(event.data.data);
							synced = true;
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
      						
      						$rootScope.networkError = true;
      						$rootScope.$broadcast('network_issue',{});
							worker.port.close();
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
		    worker.port.start();
		}
	}else{
		
		if(localStorage.tabclosed == "true"){
			localStorage.removeItem('fon_tabs');
			localStorage.removeItem('data_obj');
		}
		
		localStorage.tabclosed = "false";
		
		assignTab();
		
		if(Object.keys(tabMap).length > 1){
			window.location.href = $location.absUrl().split("#")[0] + "views/second-tab.html";

		}else{
			worker = new Worker("scripts/services/fdpWebWorker.js");
			worker.addEventListener("message", function(event) {
		        switch (event.data.action) {
		            case "init":
		            	tabMap = JSON.parse(localStorage.fon_tabs);
		           		updateSettings('instanceId','update',localStorage.instance_id); 

						if(tabMap[tabId].isMaster){
							worker.postMessage({
		                    	"action": "sync",
		                    	to_sync: true,
		                	});	
						}else{

							if(localStorage.data_obj != undefined){
								broadcastSyncData(JSON.parse(localStorage.data_obj));
							}
							worker.postMessage({
								action:"sync",
								to_sync: false,
							});
						}
						break;
		            case "sync_completed":
		                if (event.data.data) {
		                	var data_obj = {};
		                    var synced_data = event.data.data;
		                  	tabMap = JSON.parse(localStorage.fon_tabs);
		                  	if(tabMap[tabId].isMaster){
								for(var tab in tabMap){
									tabMap[tab].isSynced = false;	
								}

								tabMap[tabId].isSynced = true;
							}

		                    if(!localStorage.data_obj){
		                    	localStorage.data_obj = JSON.stringify(synced_data);
		                    }else{
		                    	data_obj = JSON.parse(localStorage.data_obj);
		                    }
							
		                    // send data to other controllers i'm doing this to ensure order when syncing'
							broadcastSyncData(synced_data);
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
      						$rootScope.$broadcast('network_issue',undefined);
							worker.port.close();
						}
      					break;
					case "timestamp_created":
						if (event.data.data)
							ntpService.syncTime(event.data.data);
						
						break;
					case "should_sync":
						
						//only the master tab should be syncing it will pull the tabs being kept track in local storage
						tabMap = JSON.parse(localStorage.fon_tabs);
						if(tabMap[tabId].isMaster){
							worker.postMessage({
		                    	"action": "sync",
		                    	to_sync: true,
		                	});	
						}else{
							
							//needs to be fixed right now if you are a slave tab you broadcast out the data that was persisted in localstorage
							if(!tabMap[tabId].isSynced){
								if(localStorage.data_obj != undefined){
									broadcastSyncData(JSON.parse(localStorage.data_obj));
								}

								tabMap[tabId].isSynced = true;	
							}
							
							
							worker.postMessage({
								action:"sync",
								to_sync: false,
							});
						}
						break;
		        }
		    }, false);

			worker.onerror = function(evt){
		    	console.log("error with shared worker port");
		    	    console.log("Line #" + evt.lineno + " - " + evt.message + " in " + evt.filename);

		    };
		}
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
	        }

	    };

	    if(isSWSupport){
			worker.port.postMessage(events);
	    }else{
	    	worker.postMessage(events);
	    	//setInterval(version_check,1000);
	    }
	};
	
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
	if (localStorage.nodeID === undefined) {
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
			nodeID = response.match(/node=([^\n]+)/)[1];
			localStorage.nodeID = nodeID;

			
			// start shared worker
			authorizeWorker();
		})
		.error(function(response, status) {			
			switch(status){
				case 402:
					//alert("bad authentication");
					delete localStorage.me;
					delete localStorage.nodeID;
					delete localStorage.authTicket;
					$rootScope.$broadcast('no_license', undefined);

					break;
				case 404:
					$rootScope.$broadcast('network_issue',undefined);
					break;
				case 500:
					$rootScope.$broadcast('network_issue',undefined);
					break;
				default:
					/*
					localStorage.removeItem('me');
					localStorage.removeItem('nodeID');
					localStorage.removeItem('authTicket');
					$rootScope.networkError = true;
					$rootScope.$broadcast('network_issue',undefined);
					*/
					attemptLogin();
					break;
			}
		});
	}
	else {
		nodeID = localStorage.nodeID;
		authorizeWorker();
	}
	
	/**
		SCOPE FUNCTIONS
	*/
	
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
    	
		// shut off web worker
		if (worker.port)
			worker.port.close();
		else
			worker.terminate();
		
		window.onbeforeunload = null;		
		location.href = authURL;
	};
	
	this.setUnload = function() {			
		// stupid warning
		window.onbeforeunload = function() {
			
			/*if (localStorage.tabclosed)
				localStorage.tabclosed = "true";
    	
			// shut off web worker
			if (worker.port)
				worker.port.close();
			else
				worker.terminate();*/
			
			return "Are you sure you want to navigate away from this page?";
		};
	};

	/*
	 if there is sharedworker support then it will get the data from the sharedwebworker otherwise it will check localstorage for the data
	*/
    this.getFeed = function(feed) {
        if(isSWSupport){
			worker.port.postMessage({
	            "action": "feed_request",
	            "feed": feed
	        });
    	}else{
			if(localStorage.data_obj){
				var data = JSON.parse(localStorage.data_obj);
				
				if (data[feed]) {
					$rootScope.$evalAsync(function() {
						$rootScope.$broadcast(feed + '_synced', data[feed]);
					});
				}
			}
		}
    };
    
    var updateSettings = function(type,action,model){
    	var params = {
            'a.name': type,
            't': 'web',
            'action': action
        }
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

}]);