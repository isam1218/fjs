hudweb.service('ChatService', ['$q', '$rootScope', 'NtpService', 'HttpService', function($q, $rootScope, ntpService, httpService) {
	var deferred = $q.defer();
	var message_deferred = $q.defer();
	var service = this;
	var messages = [];
	
	service.getChatHistory = function(){
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	//sorts by date
	var compare = function(a,b) {
	 if (a.created < b.created)
	    return -1;
	 if (a.created > b.created)
	    return 1;
	 return 0;
	};		
	
	$rootScope.$on('chat_loaded', function(event, data) {
		
	   if(messages.length == 0)
		   messages = data;
	   /*else
	   {
		  if(messages.length != data.length)
		  {
			//sort by date
			messages.sort(compare);
			data.sort(compare);
		  
			for (var n = 0, nLen = data.length; n < cLen; n++) { 
				var match = false;
			  for (var c = 0, cLen = messages.length; c < cLen; c++) {														
			   if(data[n].created == messages[c].created && data[n].id == messages[c].id)
			   {
				   continue;
			   }
			   else
			   {
				   messages.push(data[n]); 	   
			   }
			  }				   			   
		    }
		  } 
	   }*/
		
		deferred.resolve(messages);	
	});
	
	$rootScope.$on('message_loaded', function(event, data) {
		if(messages.length == 0)
			   messages = data;
		else
				messages.push(data); 
		
		message_deferred.resolve(messages);	
	});
]);