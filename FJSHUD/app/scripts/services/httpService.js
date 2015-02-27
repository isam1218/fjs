hudweb.service('HttpService', ['$http', '$rootScope', '$location', '$q', function($http, $rootScope, $location, $q){
	/**
		Detect Current Browser
	*/
	var feeds = fjs.CONFIG.FEEDS;
	var ua = navigator.userAgent;
	var browser = ua.match(/(chrome|safari|firefox|msie)/i)[0];
	var isSWSupport = browser == "Chrome" || browser == "Firefox";
	var isMasterTab = false;
	var tabId = 1;
	var synced = false;
	

	


    var VERSIONS_PATH = "/v1/versions";
        /**
         * Versionscache servlet URL
         * @const {string}
         * @protected
         */
    var VERSIONSCACHE_PATH = "/v1/versionscache";
     window.onbeforeunload = function(){
     	//return "Are you sure you want to close the window";
     }

     window.onunload  = function(){

     }
	/**
		SHARED WORKER

	*/
	//isSWSupport = false;
	var worker = undefined;
	if(isSWSupport){
		if (SharedWorker != 'undefined') {
		    worker = new SharedWorker("scripts/services/fdpSharedWorker.js");
		    worker.port.addEventListener("message", function(event) {
		        switch (event.data.action) {
		            case "init":
		                worker.port.postMessage({
		                    "action": "sync"
		                });
		                break;
		            case "sync_completed":
		                if (event.data.data) {

		                    synced_data = event.data.data;

		                    // send data to other controllers
		                    for (feed in synced_data) {
		                        if (synced_data[feed].length > 0)
		                            $rootScope.$broadcast(feed + '_synced', synced_data[feed]);
		                    }
		                }
		                break;
		            case "feed_request":
		                $rootScope.$broadcast(event.data.feed + '_synced', event.data.data);
		                break;
					case "auth_failed":
						delete localStorage.nodeID;
						delete localStorage.authTicket;
						attemptLogin();
						break;
		        }
		    }, false);

		    worker.port.start();
		}
	}

	var assignTab = function(){

		if(!localStorage.tabs[tabId]){
			localStorage.tabs[tabId] = tabId;
			if(tabId == 1){
				isMasterTab = true;
			}
		}else{
			tabId = tabId + 1;
			assignTab();
		}
	}

	if(localStorage.tabs == undefined){
		localStorage.tabs = [] 
	}else{
		assignTab()		
	}
	var version_check = function(){
		var newFeeds ='';

		for (i = 0; i < feeds.length; i++)
			newFeeds += '&' + feeds[i] + '=';

			
		var requestUrl = fjs.CONFIG.SERVER.serverURL + (synced ? VERSIONSCACHE_PATH : VERSIONS_PATH) + "?t=web" + newFeeds
		
		
			var request = new httpRequest();
			var header = {
				"Authorization":'auth=' + authTicket,
    	  		"node":nodeID,
			}
		request.makeRequest(requestUrl,"POST",{},header,function(xmlhttp){
				 
				console.log(xmlhttp.responseText);
				 if (xmlhttp.status == 200){
					var changedFeeds = [];
		            var params = xmlhttp.responseText.split(";");
					
		            for(var i = 2; i < params.length-1; i++)
						changedFeeds.push(params[i]);
						
					if (changedFeeds.length > 0)
		               	sync_request(changedFeeds);
		            
				}else{
					delete localStorage.nodeID;
					delete localStorage.authTicket;
					attemptLogin();
				}
			
			});
	}

	var format_array = function(feed) {
    var arr = [];
	
	for (key in feed) {
		if (feed[key].items.length > 0) {
			// create xpid for each record
				for (i = 0; i < feed[key].items.length; i++)
					feed[key].items[i].xpid = key + '_' + feed[key].items[i].xef001id;
					
				arr = arr.concat(feed[key].items);
			}
		}
		
		return arr;
	}

	var sync_request = function(f){			
	var newFeeds = '';
	for (i = 0; i < f.length; i++)
		newFeeds += '&' + f[i] + '=';
	
	var request = new httpRequest();
	var header = {
				"Authorization":'auth=' + authTicket,
    	  		"node":nodeID,
	}
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds,"POST",{},header,function(xmlhttp){
		
		this.data_obj = {};
		
		if(localStorage.data_obj){
			this.data_obj = JSON.parse(localStorage.data_obj);
		}else{
			this.data_obj = {};
		}

		this.data_obj["test"] = "hello";
		if (xmlhttp.status && xmlhttp.status == 200){		
			synced_data = JSON.parse(xmlhttp.responseText.replace(/\\'/g, "'"));
			
			for (feed in synced_data) {
				// first time
				if (!synced)
					this.data_obj[feed] = synced_data[feed];
				else {
					for (key in synced_data[feed]) {
						// full replace
						if (synced_data[feed][key].xef001type == 'F')
							this.data_obj[feed][key].items = synced_data[feed][key].items;
						// update individually
						else {
							for (i = 0; i < synced_data[feed][key].items.length; i++) {
								var newItem = true;
								
								for (j = 0; j < data_obj[feed][key].items.length; j++) {
									if (synced_data[feed][key].items[i].xef001id == data_obj[feed][key].items[j].xef001id) {
										data_obj[feed][key].items[j] = synced_data[feed][key].items[i];
										newItem = false;
										break;
									}
								}
								
								if (newItem)
									this.data_obj[feed][key].items.push(synced_data[feed][key].items[i]);
							}
						}
					}
				}
			
				// split recordings up into additional feeds
				if (feed == "callrecording") {
					this.data_obj['callerrecording'] = {};
					this.data_obj['conferencerecording'] = {};
					
					for (key in synced_data[feed]) {
						this.data_obj['callerrecording'][key] = {items: []};
						this.data_obj['conferencerecording'][key] = {items: []};
					
						for (i = 0; i < synced_data[feed][key].items.length; i++) {
							if (synced_data[feed][key].items[i].conferenceId)
								this.data_obj['conferencerecording'][key].items.push(synced_data[feed][key].items[i]);
							else
								this.data_obj['callerrecording'][key].items.push(synced_data[feed][key].items[i]);
						}
					}
					
					synced_data['callerrecording'] = format_array(this.data_obj['callerrecording']);
					synced_data['conferencerecording'] = format_array(this.data_obj['conferencerecording']);
				}
				else
					synced_data[feed] = format_array(this.data_obj[feed]);
			}

			localStorage.data_obj = JSON.stringify(this.data_obj);
			
			synced = true;

			 for (feed in synced_data) {
		            if (synced_data[feed].length > 0)
		                $rootScope.$broadcast(feed + '_synced', synced_data[feed]);
		      }
		}
		
	});
	}

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
	    	setInterval(version_check,500);
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
            + "&lang=eng"
            + "&revoke_token="; // + authTicket;
		console.log(authURL);
		location.href = authURL;
	};
	
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
			console.log("Error accessing this api: "  + fjs.CONFIG.SERVER.serverURL 
			+ '/accounts/ClientRegistry?t=web&node=&Authorization=' 
			+ authTicket)
			attemptLogin();
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
            + "&redirect_uri=" + encodeURIComponent(location.href)
            + "&display=page"
            + "&client_id=web.hud.fonality.com"
            + "&lang=eng"
            + "&revoke_token=" + authTicket;
			
		delete localStorage.authTicket;
		delete localStorage.nodeID;
			
		location.href = authURL;
	};
	
    this.getFeed = function(feed) {
        if(isSWSupport){
			worker.port.postMessage({
	            "action": "feed_request",
	            "feed": feed
	        });
    	}
    };
    
    this.updateSettings = function(type, action, model) {
        var params = {
            'a.name': type,
            't': 'web',
            'action': action
        }
        if (model) {
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
        //.post(requestURL,params);
    };
    
    this.get_avatar = function(pid, width, height) {
        if (pid) {
            return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + pid + "&w=" + width + "&h=" + height + "&Authorization=" + authTicket + "&node=" + nodeID;
    
        } else {
            return "img/Generic-Avatar-Small.png";
        }
    };
	
	this.get_audio = function(key) {
		return fjs.CONFIG.SERVER.serverURL + '/v1/vm_download?id=' + key + '&play=1&t=web&Authorization=' + authTicket + '&node=' + nodeID;
	};

    this.get_attachment = function(xkeyUrl){

    	if(xkeyUrl){
    		return fjs.CONFIG.SERVER.serverURL + xkeyUrl + "&Authorization=" + authTicket + "&node=" + nodeID;
    	}
    }
    
    this.upload_attachment = function(data,attachments) {
        var params = {
            'Authorization': authTicket,
            'node': nodeID,
        }
		var fd = new FormData();
    
        for (field in data) {
            fd.append(field, data[field]);
        }

        for (i in attachments){
        	fd.append('a.attachments',attachments[i]);
        }

        var requestURL = fjs.CONFIG.SERVER.serverURL + "/v1/streamevent?Authorization=" + authTicket + "&node=" + nodeID;
    
        $http.post(requestURL, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
            }
        })
    };

    this.update_avatar = function(data) {
        var params = {
            'Authorization': authTicket,
            'node': nodeID,
        }
    
        var fd = new FormData();
    
        for (field in data) {
            fd.append(field, data[field]);
        }
        var requestURL = fjs.CONFIG.SERVER.serverURL + "/v1/settings?Authorization=" + authTicket + "&node=" + nodeID;
    
        $http.post(requestURL, fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined,
            }
        })
    };
  
	// generic 'save' function
	this.sendAction = function(feed, action, data) {
		// format request object
		var params = {
			t: 'web',
			action: action
		};
		for (key in data)
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
	this.getChat = function(feed, xpid, version) {
		var deferred = $q.defer();
		
		// format request object
		var params = {
			alt: 'j',
			's.limit': 60,
			'sh.filter': '{"type":"f.conversation","key":{"feedName":"' + feed + '","xpid":"' + xpid + '"}}',
			'sh.versions': '0:0@1100000000:' + (version ? version : 0) 
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
	
			for (key in data) {
				// create xpid for each record
				for (i = 0; i < data[key].items.length; i++)
					data[key].items[i].xpid = key + '_' + data[key].items[i].xef001id;
				
				// send items back to controller
				deferred.resolve(data[key]);
			}
		});
		
		return deferred.promise;
	};

}]);