var fjs = {};
importScripts("fdpRequest.js");
importScripts("/app/properties.js");

var ports = [];
var synced = false;

var node = undefined;
var auth = undefined;

var feeds = ['me', 'settings', 'groups', 'contacts'];

var data_obj = {};
onconnect = function(event){
	var port = event.ports[0];
	ports.push(port);
	port.start();
	port.addEventListener("message",
        function(event) { onmessage(event, port); } );
}

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

function sync_request(f){			
	var newFeeds = '';
		for (i = 0; i < f.length; i++)
			newFeeds += '&' + f[i] + '=';
	
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds,"POST",{},header,function(xmlhttp){
		if(xmlhttp.status && xmlhttp.status == 200){
			var sync_response = {
				"action": "sync_completed",
				"data": xmlhttp.responseText,
			}
			
			synced_data = JSON.parse(xmlhttp.responseText);
			for (feed in synced_data){
				data_obj[feed] = synced_data[feed];
			}
			
			for (i = 0; i < ports.length; i++)
				ports[i].postMessage(sync_response);
				
			synced = true;
		}
		
		// again, again!
		do_version_check();
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
                do_version_check();
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