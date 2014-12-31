var fjs = {};
importScripts("fdpRequest.js")
importScripts("/app/properties.js")


var ports = [];

var connection = 0;
var node = undefined;
var auth = undefined;

var feeds = ['me','settings'];

onconnect = function(event){
	var port = event.ports[0];
	ports.push(port);
	port.start();
	port.addEventListener("message",onmessage);
}

onmessage = function(event){
	if(event.data.action){
		switch(event.data.action){
			case 'authorized':
				node = event.data.data.node;
				auth = event.data.data.auth;
				ports[0].postMessage({"action":"init"})
				break;	
			case 'sync':
				setInterval(do_version_check, 5000);
				break;
		}

	}
};


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
			ports[0].postMessage(sync_response);
		}
	});
}

function do_version_check(){
	var newFeeds ='';

	for (i = 0; i < feeds.length; i++)
		newFeeds += '&' + feeds[i] + '=';
			
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.VERSIONS_PATH +"?t=web" + newFeeds,"POST",{},header,function(xmlhttp){
		if(xmlhttp.status && xmlhttp.status == 200){
			//var response = xmlhttp.responseText.split(';');
			var changedFeeds = [];
            var params = xmlhttp.responseText.split(";");
           for(var i = 2; i < params.length-1; i++)
                changedFeeds.push(params[i]);
			
			if (changedFeeds.length > 0)
               	sync_request(changedFeeds);
			
			//sync_request(changedFeeds);
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






