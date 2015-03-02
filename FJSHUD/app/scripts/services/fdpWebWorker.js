importScripts("fdpRequest.js");
importScripts("../../properties.js");

var synced = false;
var node = undefined;
var auth = undefined;
var feeds = fjs.CONFIG.FEEDS;
var data_obj = {};

var is_dirty = false;

self.addEventListener('message',function(event){
	if(event.data.action){
		switch(event.data.action){
			case 'authorized':
				node = event.data.data.node;
				auth = event.data.data.auth;
				self.postMessage({"action":"init"});
				
				break;	
			case 'sync':
				if(event.data.data != undefined){
					data_obj = event.data.data;
				}
				
				if(event.data.to_sync){
					version_check();
				}else{
					setTimeout('should_sync();', 500);
				}

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


function should_sync(){
	self.postMessage({
		action:'should_sync',
	})
}

function version_check (){
		var newFeeds ='';

		for (i = 0; i < feeds.length; i++)
			newFeeds += '&' + feeds[i] + '=';

			
		
		
		var request = new httpRequest();
		var requestUrl = fjs.CONFIG.SERVER.serverURL + (synced ? request.VERSIONSCACHE_PATH : request.VERSIONS_PATH) + "?t=web" + newFeeds
		
			var header = {
				"Authorization":auth,
    	  		"node":node,
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
		            else
		            	setTimeout('should_sync();', 500);
				}else{
					//delete localStorage.nodeID;
					//delete localStorage.authTicket;
					//attemptLogin();
					self.postMessage({
						action:'auth_failed'
					})
					setTimeout('should_sync();', 500);
				}
			
		});
}

var sync_request = function(f){			
	var newFeeds = '';
	for (i = 0; i < f.length; i++)
		newFeeds += '&' + f[i] + '=';
	
	var request = new httpRequest();
	var header = {
				"Authorization":auth,
    	  		"node":node,
	}
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
						if (synced_data[feed][key].xef001type == 'F')
							data_obj[feed][key].items = synced_data[feed][key].items;
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
					
						for (i = 0; i < synced_data[feed][key].items.length; i++) {
							if (synced_data[feed][key].items[i].conferenceId)
								data_obj['conferencerecording'][key].items.push(synced_data[feed][key].items[i]);
							else
								data_obj['callerrecording'][key].items.push(synced_data[feed][key].items[i]);
						}
					}
					
					synced_data['callerrecording'] = format_array(data_obj['callerrecording']);
					synced_data['conferencerecording'] = format_array(data_obj['conferencerecording']);
				}
				else
					synced_data[feed] = format_array(data_obj[feed]);
			}

			//localStorage.data_obj = JSON.stringify(this.data_obj);
			
			synced = true;


			var sync_response = {
				"action": "sync_completed",
				"data": synced_data
			};

			self.postMessage(sync_response);
			setTimeout('should_sync();', 500);
		}else{
			self.postMessage({
				action:'auth_failed'
			})
		}
		
	});
	}
