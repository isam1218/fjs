var fjs = {};
importScripts("fdpRequest.js");
importScripts("../../properties.js");

var request = new httpRequest();
var header = {};

var synced = false;
var sync_delay = fjs.CONFIG.SYNC_DELAY;
var sync_failures = 0;

var data_obj = {};
var feeds = fjs.CONFIG.FEEDS;
var timestamp_flag = false;
var temp_feed;

self.addEventListener('message',function(event){
	if(event.data.action){
		switch(event.data.action){
			case 'authorized':
				// server url was updated
				if(event.data.data.serverURL && event.data.data.serverURL != undefined){
					fjs.CONFIG.SERVER.serverURL = event.data.data.serverURL;
				}
				
				// ajax request headers
				header = {
					"Authorization": event.data.data.auth,
					"node": event.data.data.node,
				};
				
				self.postMessage({"action":"init"});
				
				break;	
			case 'sync':
				do_version_check();
				break;	
			case 'feed_request':
				get_feed_data(event.data.feed);
				break;
			case 'delete':
				var feed = event.data.feed;
				var key = event.data.xpid.split('_')[0];
				
				if (data_obj[feed] && data_obj[feed][key]) {
					for (var i = 0, len = data_obj[feed][key].items.length; i < len; i++) {
						if (data_obj[feed][key].items[i].xpid == event.data.xpid) {
							// force delete flag
							data_obj[feed][key].items[i].xef001type = 'delete';
							break;
						}
					}
				}
			
				break;
			case 'add':
				request.abort();
				temp_feed = event.data.feed;
				
				break;
		}
	}
});

function get_feed_data(feed){
	self.postMessage({
		"action": "feed_request",
		"feed": feed,
		"data": format_array(data_obj[feed])
	});
}

function format_array(feed) {
    var arr = [];
	
	for (var key in feed) {
		if (feed[key].items.length > 0) {
			// create xpid for each record
			for (var i = 0, iLen = feed[key].items.length; i < iLen; i++)
				feed[key].items[i].xpid = key + '_' + feed[key].items[i].xef001id;
				
			arr = arr.concat(feed[key].items);
		}
	}
	
	return arr;
}

function sync_request(f){			
	var newFeeds = '';
	for (var i = 0; i < f.length; i++)
		newFeeds += '&' + f[i] + '=';
	
	var url = fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds;
	
	request.makeRequest(url,"POST",{},header,function(xmlhttp){
		if (xmlhttp.status && xmlhttp.status == 200){
			// account for characters that may break parse
			var synced_data = JSON.parse(xmlhttp.responseText
				.replace(/\\'/g, "'")
				.replace(/([\u0000-\u001F])/g, function(match) {
					var c = match.charCodeAt();
					return "\\u00" + Math.floor(c/16).toString(16) + (c%16).toString(16);
				})
			);
			
			for (var feed in synced_data) {
				// first time
				if (!data_obj[feed])
					data_obj[feed] = synced_data[feed];
				else {
					for (var key in synced_data[feed]) {
						// full replace
						if (synced_data[feed][key].xef001type == 'F'){
							if(data_obj[feed]){
								data_obj[feed][key].items = synced_data[feed][key].items;
							}else{
								data_obj[feed] = synced_data[feed];
							}
						}
						// update individually
						else {
							for (var i = 0, iLen = synced_data[feed][key].items.length; i < iLen; i++) {
								var newItem = true;
								
								if(data_obj[feed]){
									for (var j = 0, jLen = data_obj[feed][key].items.length; j < jLen; j++) {
										// replace data
										if (synced_data[feed][key].items[i].xef001id == data_obj[feed][key].items[j].xef001id) {
											data_obj[feed][key].items[j] = synced_data[feed][key].items[i];
											newItem = false;
											break;
										}
										
										// flag old sip object for removal
										if (feed == 'mycalls' && synced_data[feed][key].items[i].sipId !== undefined && data_obj[feed][key].items[j].sipId !== undefined && synced_data[feed][key].items[i].sipId == data_obj[feed][key].items[j].sipId) {
											data_obj[feed][key].items[j].xef001type = 'delete';
											break;
										}
									}	
								}
								else{
									//recreate the object mapping for synced feed in shareworker
									newItem = false;
									data_obj[feed] = synced_data[feed];
								}								
								
								if (newItem)
									data_obj[feed][key].items.push(synced_data[feed][key].items[i]);
							}
						}
					}
				}
				
				synced_data[feed] = format_array(data_obj[feed]);
			}
			
			var sync_response = {
				"action": "sync_completed",
				"data": synced_data,
			};
			
			self.postMessage(sync_response);
			synced = true;
		}
		
		resume_sync(xmlhttp.status);
	});
}

function do_version_check() {
	var url = fjs.CONFIG.SERVER.serverURL;

	// only need full list on initial sync
	if (!synced) {
		url += request.VERSIONS_PATH + '?t=web';
		
		for (var i = 0, iLen = feeds.length; i < iLen; i++)
			url += '&' + feeds[i] + '=';
	}
	// new feed entered the game
	else if (temp_feed) {
		url += request.VERSIONS_PATH + '?t=web&' + temp_feed + '=';
		temp_feed = null;
	}
	// normal version check
	else
		url += request.VERSIONSCACHE_PATH + '?t=web';
	
	request.makeRequest(url,"POST",{},header,function(xmlhttp){
		if (xmlhttp.status == 200){
			var changedFeeds = [];
			var params = xmlhttp.responseText.split(";");
			
			if (!timestamp_flag){
				self.postMessage({
					"action": "timestamp_created",
					"data": params[0]
				});
				
				timestamp_flag = true;      	
			}
			
            for(var i = 2, iLen = params.length-1; i < iLen; i++)
				changedFeeds.push(params[i]);
				
			if (changedFeeds.length > 0)
               	sync_request(changedFeeds);
            else
				setTimeout('do_version_check();', sync_delay);
		}
		else {
			// first sync may be stuck, so try to re-auth after 5 tries
			if (!synced) {
				sync_failures++;
				
				if (sync_failures >= 5) {
					self.postMessage({
						"action": "auth_failed"
					});
					
					return;
				}
			}
			
			resume_sync(xmlhttp.status);
		}
	});
}	

function resume_sync(status) {
	if (status == 404 || status == 500 || status == 503) {
		self.postMessage({
			"action": "network_error"
		});
	}
	else if (status != 0 && status != 200) {
		self.postMessage({
			"action": "auth_failed"
		});
		
		// don't version check anymore
		return;
	}
	
	// continue le loop
	setTimeout('do_version_check();', sync_delay);
}
