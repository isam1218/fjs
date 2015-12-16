hudweb.service('ChatService', ['$q', '$rootScope', function($q, $rootScope) {
	var deferred = $q.defer();
	var message_deferred = $q.defer();
	var service = this;
	var messages = [];
	
	service.getChatHistory = function(){
		deferred = $q.defer();
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	service.getChatMessage = function(){		
		// waits until data is present before sending back
		return message_deferred.promise;
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
		if(!data || data == undefined || !$.isArray(data) || ($.isArray(data) && data.length == 0))
			messages = [];
		else
		{	
			messages = data; 
			messages.sort(compare);
		}
		$rootScope.$apply(deferred.resolve(messages));			  
	});
	
	//pull the messages
	$rootScope.$on('message_loaded', function(event, data) {
		var message = data;
		message.id = message.message_id;
		var is_in = false; 
		
		if(messages.length > 0)
		{
			$.each(messages, function(){				
				if($(this)[0].id == message.id)
					is_in = true;
			});
		}
		
		
		if(!is_in)
		{	
			
			messages.push(message);	
			$rootScope.$apply();						
		}	
	});
}]);