var fjs = {};
importScripts("fdpRequest.js")
importScripts("/app/properties.js")


var ports = [];

var node = undefined;
var auth = undefined;

var feeds = ['me','contacts','settings'];

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
				console.log("setting authorization" + node + auth);	
			case 'sync':
				console.log("sync_ing")
				setInterval(do_version_check, 1000);
				break;
		}

	}
};


function sync_request(){

	var newFeeds = '';
		for (i = 0; i < feeds.length; i++)
			newFeeds += '&' + feeds[i] + '=';
	
	var request = new httpRequest();
	var header = construct_request_header();
	request.makeRequest(fjs.CONFIG.SERVER.serverURL + request.SYNC_PATH+"?t=web"+ newFeeds,"POST",{},header,function(xmlhttp){
		if(xmlhttp.status && xmlhttp.status == 200){
		}
		//ports[0].postMessage(xmlhttp.responseText);
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
			sync_request();
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






