hudweb.service('HttpService', ['$http', '$rootScope', '$location', '$q', function($http, $rootScope, $location, $q){
	/**
		SHARED WORKER
	*/
	var worker = undefined;
	
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
					attemptLogin();
					break;
	        }
	    }, false);

	    worker.port.start();
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

	    /*var pluginApi = document.getElementById('phone');
		var version=pluginApi.version;
		var session = pluginApi.getSession('5549_7340');
		session.authorize(authTicket,nodeID,'huc-dev.fonality.com');
		var win = session.createFloatWindow;
		var alert = session.alertAPI;
		alert.initAlert('../../popup.html');
		alert.setAlertSize(100,100);
		alert.setLocation(100,100);

		win.initWindow('../../popup.html');
		win.setAlwaysOnTop(true);
		*/
	    worker.port.postMessage(events);
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
		$http.post(
			fjs.CONFIG.SERVER.serverURL 
			+ '/accounts/ClientRegistry?t=web&node=&Authorization=' 
			+ authTicket
		)
		.success(function(response) {
			nodeID = response.match(/node=([^\n]+)/)[1];
			localStorage.nodeID = nodeID;
			
			// start shared worker
			authorizeWorker();
		})
		.error(function() {
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
        worker.port.postMessage({
            "action": "feed_request",
            "feed": feed
        })
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
			// send items back to controller
			var data = JSON.parse(response.data.replace(/\\'/g, "'"));
			for (i in data)
				deferred.resolve(data[i]);
		});
		
		return deferred.promise;
	};
}]);