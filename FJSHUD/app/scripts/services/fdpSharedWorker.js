var fjs = {};
importScripts("fdpRequest.js");
importScripts("/app/properties.js");

var ports = [];
var synced = false;

var node = undefined;
var auth = undefined;

var data_obj = {};
var feeds = ['me', 'settings', 'groups', 'contacts', 'contactstatus', 'queues', 'quickinbox', 'calls'];

onconnect = function(event){
	var port = event.ports[0];
	ports.push(port);
	port.start();
	port.addEventListener("message",
        function(event) { onmessage(event, port); } );
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
			"action":"feed_request",
			"feed":feed,
			"data":data_obj[feed]
		});
	}
}

function format_array(feed) {
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

function sync_request(f){			
	var newFeeds = '';
	for (i = 0; i < f.length; i++)
		newFeeds += '&' + f[i] + '=';
	
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds,"POST",{},header,function(xmlhttp){
		if(xmlhttp.status && xmlhttp.status == 200){			
			synced_data = JSON.parse(xmlhttp.responseText);
			
			for (feed in synced_data){
				data_obj[feed] = format_array(synced_data[feed]);
				synced_data[feed] = data_obj[feed];
			}
			
			var sync_response = {
				"action": "sync_completed",
				"data": synced_data,
			}
			
			for (i = 0; i < ports.length; i++)
				ports[i].postMessage(sync_response);
				
			synced = true;
		}
		
		// again, again!
		setTimeout('do_version_check();', 500);
	});
}

function do_version_check(){
	var newFeeds ='';

	for (i = 0; i < feeds.length; i++)
		newFeeds += '&' + feeds[i] + '=';
			
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + (synced ? request.VERSIONSCACHE_PATH : request.VERSIONS_PATH) +"?t=web" + newFeeds,"POST",{},header,function(xmlhttp){
		if(xmlhttp.status && xmlhttp.status == 200){
			var changedFeeds = [];
            var params = xmlhttp.responseText.split(";");
			
            for(var i = 2; i < params.length-1; i++)
				changedFeeds.push(params[i]);
				
			if (changedFeeds.length > 0)
               	sync_request(changedFeeds);
            else
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
