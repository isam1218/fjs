var fjs = {};
importScripts("fdpRequest.js");
importScripts("../../properties.js");

var synced = false;

var node = undefined;
var auth = undefined;

var data_obj = {};
var feeds = fjs.CONFIG.FEEDS;
var timestamp_flag = false;

self.addEventListener('message',function(event){
	if(event.data.action){
		switch(event.data.action){
			case 'authorized':
				node = event.data.data.node;
				auth = event.data.data.auth;
				self.postMessage({"action":"init"});
				
				break;	
			case 'sync':
				do_version_check();

				break;
			case 'feed_request':
				get_feed_data(event.data.feed);
				
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
	
	var request = new httpRequest();
	var url = fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds;
	var header = construct_request_header();
	
	request.makeRequest(url,"POST",{},header,function(xmlhttp){
		if (xmlhttp.status && xmlhttp.status == 200){		
			var synced_data = JSON.parse(xmlhttp.responseText.replace(/\\'/g, "'"));
			
			for (var feed in synced_data) {
				// first time
				if (!synced)
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
										if (synced_data[feed][key].items[i].xef001id == data_obj[feed][key].items[j].xef001id) {
											data_obj[feed][key].items[j] = synced_data[feed][key].items[i];
											newItem = false;
											break;
										}
									}	
								}else{
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
		else{
			self.postMessage({
				"action": "auth_failed"
			});
		}
		
		// again, again!
		setTimeout('do_version_check();', 500);
	});
}

function do_version_check(){
	var newFeeds ='';

	for (var i = 0, iLen = feeds.length; i < iLen; i++)
		newFeeds += '&' + feeds[i] + '=';
			
	var request = new httpRequest();
	var url = fjs.CONFIG.SERVER.serverURL + (synced ? request.VERSIONSCACHE_PATH : request.VERSIONS_PATH) +"?t=web" + newFeeds;
	var header = construct_request_header();
	
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
				setTimeout('do_version_check();', 500);
		}
		else if(xmlhttp.status == 404 || xmlhttp.status == 500){
			self.postMessage({
				"action": "network_error"
			});
		}
		else if (xmlhttp.status == 0) {
			setTimeout('do_version_check();', 500);
		}
		else {
			self.postMessage({
				"action": "auth_failed"
			});
		}
	});
}	

function construct_request_header(){
	var header = {
		"Authorization":auth,
    	"node":node,
  	};

  	return header;
}
