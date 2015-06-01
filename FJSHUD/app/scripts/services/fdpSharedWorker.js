var fjs = {};
importScripts("fdpRequest.js");
importScripts("../../properties.js");

var ports = [];
var synced = false;

var node = undefined;
var auth = undefined;

var data_obj = {};
var feeds = fjs.CONFIG.FEEDS;

onconnect = function(event){
	var port = event.ports[0];
	ports.push(port);
	port.start();
	port.addEventListener("message",
        function(event) { onmessage(event, port); } );
		
	// force versioncache
	synced = false;
};

onmessage = function(event, port){
	if(event.data.action){
		switch(event.data.action){
			case 'authorized':
				node = event.data.data.node;
				auth = event.data.data.auth;
				ports[0].postMessage({"action":"init"});
				break;	
			case 'sync':
				do_version_check();
				break;
			case 'feed_request':
				get_feed_data(event.data.feed);
				break;
		}
	}
};

function get_feed_data(feed){
	for(i = 0; i < ports.length;i++){
		ports[i].postMessage({
			"action": "feed_request",
			"feed": feed,
			"data": format_array(data_obj[feed])
		});
	}
}

function format_array(feed) {
    var arr = [];
	
	for (key in feed) {
		if (feed[key].items.length > 0) {
			// create xpid for each record
			for (var i = 0; i < feed[key].items.length; i++)
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
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds,"POST",{},header,function(xmlhttp){
		if (xmlhttp.status && xmlhttp.status == 200){		
			synced_data = JSON.parse(xmlhttp.responseText.replace(/\\'/g, "'"));
			
			for (feed in synced_data) {
				// first time
				if (!synced)
					data_obj[feed] = synced_data[feed];
				else {
					for (key in synced_data[feed]) {
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
							for (var i = 0; i < synced_data[feed][key].items.length; i++) {
								var newItem = true;
								if(data_obj[feed]){
									for (var j = 0; j < data_obj[feed][key].items.length; j++) {
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
			
				// split recordings up into additional feeds
				if (feed == "callrecording") {
					data_obj['callerrecording'] = {};
					data_obj['conferencerecording'] = {};
					
					for (key in synced_data[feed]) {
						data_obj['callerrecording'][key] = {items: []};
						data_obj['conferencerecording'][key] = {items: []};
					
						for (var i = 0; i < synced_data[feed][key].items.length; i++) {
							if (synced_data[feed][key].items[i].conferenceId)
								data_obj['conferencerecording'][key].items.push(synced_data[feed][key].items[i]);
							else
								data_obj['callerrecording'][key].items.push(synced_data[feed][key].items[i]);
						}
					}
					
					synced_data['callerrecording'] = format_array(data_obj['callerrecording']);
					synced_data['conferencerecording'] = format_array(data_obj['conferencerecording']);
				}
				
				synced_data[feed] = format_array(data_obj[feed]);
			}
			
			var sync_response = {
				"action": "sync_completed",
				"data": synced_data
			};
			
			for (var i = 0; i < ports.length; i++)
				ports[i].postMessage(sync_response);
				
			synced = true;
		}
		
		// again, again!
		setTimeout('do_version_check();', 500);
	});
}

function do_version_check(){
	var newFeeds ='';

	for (var i = 0; i < feeds.length; i++)
		newFeeds += '&' + feeds[i] + '=';
			
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + (synced ? request.VERSIONSCACHE_PATH : request.VERSIONS_PATH) +"?t=web" + newFeeds,"POST",{},header,function(xmlhttp){
		if (xmlhttp.status == 200){
			var changedFeeds = [];
            var params = xmlhttp.responseText.split(";");
			
            for(var i = 2; i < params.length-1; i++)
				changedFeeds.push(params[i]);
				
			if (changedFeeds.length > 0)
               	sync_request(changedFeeds);
            else
				setTimeout('do_version_check();', 500);
		}
		else{
			for(i = 0; i < ports.length;i++){
				ports[i].postMessage({
					"action": "auth_failed"
				});
			}
			setTimeout('do_version_check();', 500);
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
