hudweb.factory('WebSocket', ['$q', '$rootScope','SettingsService', function($q, $rootScope, settingsService) {
    // We return this object to anything injecting our service
    var Service = {};
    // Keep all pending requests here until they get responses
    var callbacks = {};
    // Create a unique callback ID to map requests to responses
    var currentCallbackId = 0;
    // Create our websocket object with the address to the websocket
    var ws = new WebSocket("ws://dev-svc1.arch.fonality.com:1234");
    
    ws.onopen = function(){  
        console.log("Socket has been opened!");  
    };
    
    ws.onmessage = function(message) {
        listener(JSON.parse(message.data));
    };

    function sendRequest(request) {
      var defer = $q.defer();
      var callbackId = getCallbackId();
      callbacks[callbackId] = {
        time: new Date(),
        cb:defer
      };
      request.callback_id = callbackId;
      console.log('Sending request', request);
      ws.send(JSON.stringify(request));
      return defer.promise;
    }

    function listener(data) {
      var messageObj = data;
      console.log("Received data from websocket: ", messageObj);
      // If an object exists with callback_id in our callbacks object, resolve it
      if(callbacks.hasOwnProperty(messageObj.callback_id)) {
        console.log(callbacks[messageObj.callback_id]);
        $rootScope.$apply(callbacks[messageObj.callback_id].cb.resolve(messageObj.data));
        delete callbacks[messageObj.callbackID];
      }
    }
    // This creates a new callback ID for a request
    function getCallbackId() {
      currentCallbackId += 1;
      if(currentCallbackId > 10000) {
        currentCallbackId = 0;
      }
      return currentCallbackId;
    }

    // Define a "getter" for getting customer data
    Service.getContacts = function() {
      var d = new Date().getTime().toString();
      var current_user = settingsService.getMe().$$state.value;
	  var my_id = current_user.my_pid.split('_')[1];		
	  var server_id = current_user.server_id;	
	  
      var request = {
    		  reqType: "contactList",
    		  ts: d,
    		  sender: 'U:'+ server_id + ':' + my_id
      }
      // Storing in a variable for clarity on what sendRequest returns
      var promise = sendRequest(request); 
      return promise;
    }

 // Define a "getter" for getting customer data
    Service.getChatHistory = function(contactId) {
      var d = new Date().getTime().toString();
      var current_user = settingsService.getMe().$$state.value;
  	  var my_id = current_user.my_pid.split('_')[1];		
  	  var server_id = current_user.server_id;  	
	  var current_user = settingsService.getMe().$$state.value;
	  var my_id = current_user.my_pid.split('_')[1];		
	  var server_id = current_user.server_id;		
	
      var request = {
    		  reqType: "chatHistory",
    		  ts: d,
    		  sender: 'U:'+ server_id + ':' + my_id,
    		  body: {
    			  chatType: 'user',
    			  targetId: contactId
    		  }
      }
      // Storing in a variable for clarity on what sendRequest returns
      var promise = sendRequest(request); 
      return promise;
    }
    return Service;
}]);