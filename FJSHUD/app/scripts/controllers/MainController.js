hudweb.controller('MainController', ['$rootScope', '$scope', '$timeout', '$q', '$routeParams', 'GroupService', 'HttpService','SettingsService', 'ContactService', '$location', function($rootScope, $scope, $timeout, $q, $routeParams, groupService, myHttpService, settingsService, contactService, $location) {
	$rootScope.myPid = null;
	$rootScope.token = localStorage.authTicket || null;
	$rootScope.myName = localStorage.username || null;
	$scope.loginError = false;
	$scope.number = "";
	$scope.currentPopup = {};
	$scope.currentPopup.url = null;
	$scope.currentPopup.x = 0;
	$scope.currentPopup.y = 0;
	$scope.pluginDownloadUrl = $scope.browser != 'Chrome' ? fjs.CONFIG.PLUGINS[$scope.platform] : fjs.CONFIG.PLUGINS[$scope.platform + "_NEW"];
	$scope.isLoaded = false;
	$scope.contacts = [];	
	$rootScope.sock = null;
	var wsuri = "ws://10.10.12.125:1234";	
	$scope.wsuri = "ws://dev-svc1.arch.fonality.com:1234";
	$scope.contactList = [];
	
	$scope.overlay = {
		show: false,
		url: '',
		data: null
	};
	
	$scope.checkValidToken = function(){
		var me = JSON.parse(localStorage.me);
        var username = me.username;
        var server_id = (me.serverId).toString();
        var my_id = (me.id).toString();
		
		var tokenObj = {};
		tokenObj.reqType = "auth/validateToken";
		tokenObj.ts = parseInt(new Date().getTime(),10);
		tokenObj.sender = 'U:'+ server_id + ':' + my_id;
		var body = {};
		body.username = username;
		body.token = $rootScope.token;		
		
		tokenObj.body = JSON.stringify(body);
				
		var tokenJson = JSON.stringify(tokenObj);	
		//if($rootScope.sock == null)
		//	$rootScope.sock = new WebSocket($scope.wsuri);	
		
		$rootScope.sock.send(tokenJson);	
	};
	/*
	if($rootScope.token != null)
	{
		$scope.checkValidToken();
	};	*/
	//sort by username
	var compare = function(a,b) {
    	if (a.username < b.username)
    	    return -1;
    	if (a.username > b.username)
    	    return 1;
    	return 0;
   	};	
    //sorts by date
   	var dateCompare = function(a,b) {
   		  if (a.created < b.created)
   		    return -1;
   		  if (a.created > b.created)
   		    return 1;
   		  return 0;
   	}
   		
	// prevents overlapping digest cycles
    $scope.$safeApply = function(fn) {
        var phase = $scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            if(fn && (typeof(fn) === 'function')) {
                $scope.$apply(fn);
            }
            else {
                $scope.$apply();
            }
        }
    }; 
    
    
  //get the chat history
    $scope.getHistoryObject = function(responseBody)
    {  
        if(!responseBody || responseBody == null || responseBody == "null" || responseBody.length == 0)
    		return [];
    		
    	var historyObj = responseBody;//JSON.parse(responseBody);//.replace(/[^\w\s]/gi, '').toLowerCase();
    	var contactsLen = $scope.contactList.length;
    	
    	if($.isArray(historyObj))
    	{	    	  
    	  historyObj.sort(dateCompare);
    	  
    	  var historyLen = historyObj.length;    	  
    	 
    	  for(var c = 0; c < contactsLen; c++)
		  {
			  var contact = $scope.contactList[c];
			  
			  for(var h = 0; h < historyLen; h++)
			  {
    		  	  var chat_obj = historyObj[h];
    		  
    			  if(contact.id == chat_obj.senderId)
    			  {
    				  chat_obj.username = contact.username;
    				  chat_obj.fullName = contact.firstName + ' ' + contact.lastName;
    			  }	  
    		  }	  
    	  }    	      	      	 
    	  return historyObj;
    	} 
    	else //one message
    	{
    		if(typeof historyObj == 'object')
    		{	
	    		for(var c = 0; c < contactsLen; c++)
	  		    {
	    			var contact = $scope.contactList[c];
	    			if(contact.id == historyObj.id)
	    				historyObj.username = contact.username;
	    			    historyObj.fullName = contact.firstName + ' ' + contact.lastName;
	  		    }
	    		return historyObj;
    		}
    	}
    	return [];
    };
    
    //get chat message
    $scope.getChatMessage =  function(chatMsg){		
        if(chatMsg && chatMsg.content_name && 
           chatMsg.content_name == "chatMessage")
        {	        	
        	return chatMsg.body.Message;          	
        }
    };                         
    //get the group list
	var getGroupList = function()
	{      	    	
		var myObj = {};
		var body = {};
		var d = new Date();	
		var current_user = $rootScope.meModel.fullProfile;//settingsService.getMe().$$state.value;
		var my_id = ($rootScope.meModel.fullProfile.id).toString();//current_user.my_pid;//.split('_')[1];		
		var server_id = (current_user.serverId).toString();//current_user.server_id;		
		var username = current_user.username;//current_user.login;
		
        myObj.reqType = "data/getGroupsForServer";		
        myObj.ts = parseInt(new Date().getTime(),10);
		myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815					
		body.serverId = server_id;
		body.groupType = "group";
		var authInfo = {};
		authInfo.username = username;
		authInfo.token = $rootScope.token;
		
		myObj.body = JSON.stringify(body);
		myObj.authInfo = JSON.stringify(authInfo);	
		var json = JSON.stringify(myObj);			
		$rootScope.sock.send(json);			
	};	  
		
	//var callEmit = function(){};
	
	//get current group (if url is a group url)
	$scope.getSelectedGroup = function()
	{
		var myObj = {};
		var body = {};
		var d = new Date();			
		var current_user = $rootScope.meModel.fullProfile;//settingsService.getMe().$$state.value;
		var my_id = (current_user.id).toString();//current_user.my_pid;//.split('_')[1];		
		var server_id = (current_user.serverId).toString();		
		var username = current_user.username;//current_user.login;
		
	    myObj.reqType = "data/getUsersInGroup";		
		myObj.ts = parseInt(new Date().getTime(),10);
		myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815		
		body.groupType = "group";
		body.groupId = $routeParams.groupId;
		body.serverId = server_id;		
		var authInfo = {};
		authInfo.username = username;
		authInfo.token = $rootScope.token;
		
		myObj.body = JSON.stringify(body);
		myObj.authInfo = JSON.stringify(authInfo);	
		var json = JSON.stringify(myObj);
		if($rootScope.sock == null)
			$rootScope.sock = new WebSocket($scope.wsuri);
		$timeout(function(){
			$rootScope.sock.send(json);			
		}, 500, false);		
	};
	
	
	//get groups
	groupService.getGroups().then(function(data) {	  
	  $rootScope.groups = data;		  
		
	  if($routeParams.groupId)
	  {							
		var singlePromise = $q(function(resolve, reject) {
			$scope.getSelectedGroup();
		}).then(function(){});
		
	  }
	});  
	
	$scope.getUserInfo = function(username){
		//var current_user = settingsService.getMe().$$state.value;			
		//var username = current_user.login;
		var username = localStorage.username;
		var token = localStorage.authTicket;
		
		var userObj = {};
		userObj.reqType = "data/getUserInfo";
		userObj.ts = parseInt(new Date().getTime(),10);
		var body = {};
		body.username = username;
		body.token = token;
		var authInfo = {};
		authInfo.username = username;
		authInfo.token = $rootScope.token;
		
		userObj.body = JSON.stringify(body);
		userObj.authInfo = JSON.stringify(authInfo);				
		var userJson = JSON.stringify(userObj);					
		$rootScope.sock.send(userJson);		
	};
	
	$scope.getContactsList = function(){
		var current_user = $rootScope.meModel.fullProfile;//settingsService.getMe().$$state.value;
		var my_id = (current_user.id).toString();//current_user.my_pid;//.split('_')[1];		
		var server_id = (current_user.serverId).toString();//current_user.server_id;		
		var username = current_user.username;//current_user.login;
		
		var contactsObj = {};
		contactsObj.reqType = "data/getContacts";	
		contactsObj.ts = parseInt(new Date().getTime(),10);
		contactsObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//+nameValue;//156815
		var body = {};
		body.serverId = server_id;
		var authInfo = {};
		authInfo.username = username;
		authInfo.token = $rootScope.token;
		
		contactsObj.body = JSON.stringify(body);
		contactsObj.authInfo = JSON.stringify(authInfo);				
		var contactsJson = JSON.stringify(contactsObj);					
		$rootScope.sock.send(contactsJson);	
	};       
	
    $scope.connectWS = function(refresh) {
		
    	 if(refresh)
    	 {	 
    		 $rootScope.sock = new WebSocket($scope.wsuri);
    		 $scope.sock.onopen = function() {	                    
 	            console.log("connected to " + $scope.wsuri); 	               	
 	      		$scope.checkValidToken();
 	      	 
    		 }; 
    	 }	 
    	 
    	 $rootScope.sock.onclose = function(e) { 		   
    		 $rootScope.sock = null;
	         console.log("connection closed (" + e.code + ")");	         
	         $rootScope.sock = new WebSocket($scope.wsuri);
	     };

	     $rootScope.sock.onmessage = function(e) {
	         // console.log("message received: " + e.data);	
	          var d = new Date();
	          try{
	        	  var responseData = JSON.parse(e.data);
	          }catch(e){}
	          
	          if(responseData) 
	          {	  
		          if(responseData.body && responseData.contentName != "chat/postMessage")
		          {	
		        	  var responseBody = responseData.body.toString().replace(/(\r\n|\n|\r)/gm,"");	
		        	  try{
		        		  responseBody = JSON.parse(responseBody);
		        	  }catch(e){}  
		        	  
		        	  switch(responseData.contentName)
		        	  {
		        	  case "data/getContacts":			            
			        	  console.log("message received: contact list ");
			        	  $scope.contactList = responseBody;
			        	  $scope.contactList.sort(compare);
			              $rootScope.$broadcast('contacts_synced', responseBody);			            	  
			              break;
			          
		        	  case "chat/getChatMessageHistoryForSession": 		        	      
			        	  console.log("message received: chat history ");
			        	  $rootScope.$broadcast('chat_loaded', $scope.getHistoryObject(responseBody));
			        	  break; 	
		        	  case "data/getGroupsForServer":
		        		  console.log("message received: group list ");
			        	  $rootScope.$broadcast('groups_loaded', responseBody);
			        	  break; 
		        	  case "data/getUsersInGroup":
		        		  console.log("message received: group list ");
			        	  $rootScope.$broadcast('single_group_loaded', responseBody);
			        	  break; 
		        	  case "auth/login":
		        		  console.log("message received: login sucessful ");
		        		  if(responseBody.token)
		        		  {	  
			        		  $rootScope.token = responseBody.token;
			        		  $scope.token = responseBody.token;
			        		  //store the token
			        		  localStorage.authTicket = responseBody.token;
			        		  $location.path('/settings/');
			        		  
			        		  var userInfoPromise = $q(function(resolve, reject) {
			        			  $scope.getUserInfo();
			        		  }).then(function(){});
		        		  }
		        		  else{
		        			  $scope.displayedError = 'username or password is incorrect.';
		        			  $scope.loginError = true;
		        			  $scope.$safeApply();
		        		  }
		        		  break; 
		        	  case "data/getUserInfo": 		
		        		  if(!$rootScope.meModel)
		        			  $rootScope.meModel = {};
		        		  
		        		  $scope.isLoaded = true;
		        		  $rootScope.meModel.fullProfile = responseBody;
		        		  $rootScope.meModel.username = responseBody.username;
		        		  $rootScope.myPid = responseBody.id;
		        		  
		        		  localStorage.me = JSON.stringify(responseBody);		        	      
		        		  
		        		  if(responseBody.firstName == '' && responseBody.lastName == '')
		        			  $rootScope.meModel.fullName = responseBody.username;
		        		  else
		        		  {
		        			  if(responseBody.firstName == '')
		        				  $rootScope.meModel.fullName = responseBody.lastName;
		        			  else
		        				  $rootScope.meModel.fullName = responseBody.firstName + ' ' + responseBody.lastName;
		        		  }	  
		        			  
		        		  
		        		  var contactsPromise = $q(function(resolve, reject) {
		  					$scope.getContactsList();
		  			      }).then(function(){});
		  				
		  				  var promise = $q(function(resolve, reject) {
		  					getGroupList();
		  			      }).then(function(){});	
			        	  break; 
		        	  case "auth/validateToken":
		        		  if(responseBody.valid)
		        			  $scope.getUserInfo();
		        		  else
		        		  {
		        			  $rootScope.token = null;
		        			  localStorage.authTicket = null;		        			 
		        			  $scope.isLoaded = true;
		        		  }
		        		  break;
		        	  }
		          }
		          
		          if(responseData.Message)		          
		          {        	
		        	 var chatMsg = JSON.parse(responseData.Message);	        	        	 
		        	 console.log("message received: chat message ");
		        	 var chatBody = chatMsg.body;
		        	 $rootScope.$broadcast('message_loaded', $scope.getHistoryObject(chatBody));	        	
		          }	
	          } 
	     }; 
	  
	     $rootScope.sock.onerror = function(error){
		     console.log('Error detected: ' + error);
		     $rootScope.sock.close();		 
		 };
	};
	
	if($rootScope.token != null)
    {       	
    	$scope.connectWS(true);				
    }
	else
	{
		$scope.isLoaded = true;
	}
		
		 /*var activityTimeout;
	
	$q.all([settingsService.getSettings()]).then(function() {//contactService.getContacts()		
		// show app
		$timeout(function() {
			angular.element(document.getElementById('AppLoading')).remove();
			
			myHttpService.setUnload();
			
			//////////////////////////////////////////////////////////////////////////////						
			//$scope.connectWS();
			/////////////////////////////////////////////////////////////////////////////
			// wake status
			document.onmousemove = function() {
				if (!activityTimeout) {
					myHttpService.sendAction('useractivity', 'reportActivity', {});
					
					// prevent ajax call from firing too often
					activityTimeout = setTimeout(function() {
						activityTimeout = null;
					}, 10000);
				}
			};
		}, 3000, false);
	});*/

    $scope.onBodyClick = function() {
        $scope.currentPopup.url = null;
        $scope.currentPopup.x = 0;
        $scope.currentPopup.y = 0;
        $scope.currentPopup.model = null;
        $scope.currentPopup.target = null;
    };

    $scope.broadcastDial = function(key){
        $scope.$broadcast("key_press",key);
    };
	
    $scope.makePhoneCall = function(type,$event){
    	switch(type){
    		case 'dialpad':
    			if ($event.keyCode == 13 && !$event.shiftKey) {
         			$scope.$broadcast("make_phone_call",$event);
    				$event.preventDefault();
				}
				break;
    	}
    };

    $scope.barge_call = function(call,bargeType){
    	var xpid = call.fullProfile.xpid;
    	myHttpService.sendAction('contacts', bargeType + 'Call', {contactId: xpid});
    	$scope.onBodyClick();
	};


    $scope.showPopup = function(data, target) {
        if(!data.key) {
            $scope.currentPopup.url = null;
            return;
        }
        else if($scope.currentPopup.url != "views/popups/"+data.key+".html") {
            $scope.currentPopup.url = "views/popups/" + data.key + ".html";
        }
        $scope.currentPopup.position = {top:data.y+"px", left:data.x+"px"};
        $scope.currentPopup.model = data.model;
        $scope.currentPopup.target = $(target).attr("type") ? $(target).attr("type") : '';
    };
	
	$scope.showOverlay = function(show, url, data) {

		$scope.overlay.show = show;
		$scope.overlay.url = url ? 'views/popups/' + url + '.html' : '';
		$scope.overlay.data = data ? data : null;
	};
	
	$scope.queueStatusLabel = function(status) {
		switch(status) {
			case 'login-permanent':
				return 'Permanent in';
				break;
			case 'login':
				return $scope.verbage.logged_in;
				break;
			case 'logout':
				return $scope.verbage.logged_out;
				break;
		}
	};

	$scope.reloadPage = function(){
		window.onbeforeunload = function(){};
		myHttpService.logout();
	};

	$scope.reload = function(){
		window.onbeforeunload = function(){};
		document.cookie = "tab=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		location.reload();
	};

	$scope.closeError = function(){
		if(!$scope.isFirstSync){
			$scope.showOverlay(false);
		}
	};

	$scope.$on('no_license',function(event,data){
		var data = {};
		
		setTimeout(function(){
			window.onbeforeunload = function(){};
			myHttpService.logout();
		},10000);

		$scope.showOverlay(true,'NoPermission',data);
		$scope.$safeApply();

	});
}]);
