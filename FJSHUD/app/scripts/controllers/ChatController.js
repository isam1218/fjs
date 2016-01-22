hudweb.controller('ChatController', ['$q', '$rootScope', '$scope','HttpService', '$routeParams', 'ContactService','ChatService', 'PhoneService', '$timeout', '$location', '$filter', 'SettingsService', 'StorageService', 'NtpService', function($q, $rootScope, $scope,httpService, $routeParams, contactService, chatService, phoneService, $timeout, $location, $filter, settingsService, storageService, ntpService) {
	
	// redirect if not allowed
	if ($scope.$parent.chatTabEnabled !== undefined && $scope.$parent.chatTabEnabled === false) {
		// only for groups and queues
		if ($routeParams.groupId)
			$location.path('group/' + $routeParams.groupId + '/members');
		else if ($routeParams.queueId && $routeParams.route == 'chat')
			$location.path('queue/' + $routeParams.queueId + '/agents');
	}

	var version = 0;
	var cutoff = ntpService.calibrateTime(new Date().getTime());
	var scrollbox = {};
	var chat = {}; // internal controller data
	
	$scope.chat = this; // ng model data
	$scope.upload = {};
	$scope.loading = true;
	$scope.showAlerts = false;
	$scope.enableChat = true;
	$scope.filteredMessages = [];
	$scope.messages = [];
	$scope.message_time = '';
	$scope.my_id = ($rootScope.meModel.fullProfile.id).toString();
	var my_id = ($rootScope.meModel.fullProfile.id).toString();
	var contactId = $routeParams.contactId;	
	var server_id = ($rootScope.meModel.fullProfile.serverId).toString();
	var username = $rootScope.meModel.username;
		
	// set chat data
	if ($routeParams.contactId) {
		chat.name = $rootScope.meModel.fullName;
		chat.audience = 'contact';
		chat.targetId = $routeParams.contactId;
		chat.type = 'f.conversation.chat';
		chat.attachmentType = 'f.conversation.wall';
		
		//$scope.enableChat = settingsService.isEnabled($rootScope.meModel.fullProfile.permissions, 8);
		$scope.enableChat = true;
	}
	else if ($routeParams.conferenceId) {
		chat.name = $scope.conference.name;
		chat.audience = 'conference';
		chat.targetId = $routeParams.conferenceId;
		chat.type = 'f.conversation.chat';
		chat.attachmentType = 'f.conversation.wall';
		
		/*$scope.enableChat = $scope.conference.status.isMeJoined;
		
		// unfortunately, we'll need to watch this value
		$scope.$watch('conference.status.isMeJoined', function(val) {
			$scope.enableChat = val;
		});*/
		$scope.enableChat = true;
	}
	else if ($routeParams.groupId) {
		chat.name = $scope.group.name;
		chat.audience = 'group';
		chat.targetId = $routeParams.groupId;
		chat.type = 'f.conversation.chat';
		chat.attachmentType = 'f.conversation.wall';
	}
	else if ($routeParams.queueId) {
		chat.name = $scope.queue.name;
		chat.audience = 'queue';
		chat.targetId = $routeParams.queueId;
		
		// alerts are a wee bit different
		if ($routeParams.route && $routeParams.route == 'alerts') {
			chat.type = 'queuemessage';
			
			$scope.showAlerts = true;
			$scope.chat.status = 3;
		}
		else {
			chat.type = 'f.conversation.chat';
			chat.attachmentType = 'f.conversation.wall'
		}
	}
	
	$scope.chat.message = storageService.getChatMessage(chat.targetId);
	
	// send to pop-up controller
	$scope.showAttachmentOverlay = function() {		
		$scope.showOverlay(true, 'FileShareOverlay', {
			name: chat.name,
			audience: chat.audience,
			xpid: chat.targetId
		});
	};

	$scope.showDownloadAttachmentOverlay = function(selected){
		var downloadables = [];
		var current = 0;
		
		for(var i = 0, iLen = $scope.messages.length; i < iLen; i++){
			if ($scope.messages[i].data && $scope.messages[i].data.attachment) {
				var attachments = $scope.messages[i].data.attachment;
				
				for(var a = 0, aLen = attachments.length; a < aLen; a++) {
					var tempAttach = attachments[a];
					tempAttach.created = $scope.messages[i].created;
					
					downloadables.push(tempAttach);
					
					// mark the one that was clicked
					if (attachments[a] == selected)
						current = downloadables.length-1;
				}
			}
		}
		
		$scope.showOverlay(true, 'FileShareOverlay', {
			downloadables: downloadables,
			current: current
		});
	};

	$scope.getAttachment = function(url,fileName){
		// show image as is
		if (fileName.match(/\.(png|jpg|jpeg|gif)$/i))
			return httpService.get_attachment(url,fileName);
		// show document image
		else if (fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|js)$/i))
			return 'img/XIcon-PreviewDocument.png';
		// show mysterious image
		else
			return 'img/XIcon-UnknownDocument.png';
	};	
	
	//this is needed to clear ng flow cache files for flow-files-submitted because ng flow will preserve previous uploads so the upload attachment will not receive it
	$scope.flow_cleanup = function($files){
		$scope.upload.flow.cancel();
		$scope.$safeApply();
	};

	$scope.uploadAttachments = function($files){
      	
		if($scope.showAlerts || !$scope.enableChat){
			return;
		}
      	
		var fileList = [];
		
		for(var i = 0, iLen = $files.length; i < iLen; i++){
      		fileList.push($files[i].file);
			
      	}
      	
        var data = {
            'action':'sendWallEvent',
            'a.targetId': chat.targetId,
            'a.type': chat.attachmentType,
            'a.xpid':"",
            'a.archive':0,
            'a.retainKeys':"",
            'a.message': '',
            'a.callback':'postToParent',
            'a.audience':chat.audience,
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "1_0",
            "_archive": 0,
        };
		httpService.upload_attachment(data,fileList);

	};
	
	// keep scrollbar at bottom until chats are loaded
	var scrollWatch = $scope.$watch(function() {
		if (scrollbox.scrollHeight)
		{	
			scrollbox = $('#ListViewContent');
			var scroll_height = $(scrollbox).outerHeight() * 4;			
			$(scrollbox).animate({ scrollTop: scroll_height }, 'slow');		
		}	
	});
	
	var conversationType = chat.type == 'f.conversation.chat' ? 'f.conversation' : chat.type;		
	
	//send a request to the websocket for the chat history
	$scope.getChatHistory = function()
	{      	    	
			var myObj = {};
			var body = {};
			var d = new Date();									
			var chatType = "user";
			var targetId = contactId;
			
			if ($routeParams.groupId) {
				chatType = "group";
				targetId = $routeParams.groupId;
			}
			
			targetId = targetId.toString()
			
	        myObj.reqType = "chat/getChatMessageHistoryForSession";
	        myObj.ts = parseInt(new Date().getTime(),10);
			myObj.sender = 'U:'+ server_id + ':' + my_id;
			body.chatType = chatType;// "user";
			body.userId = my_id;
			body.targetId = targetId;//contactId;
			var authInfo = {};
			authInfo.username = username;
			authInfo.token = $rootScope.token;
			
			myObj.body = JSON.stringify(body);
			myObj.authInfo = JSON.stringify(authInfo);
			var json = JSON.stringify(myObj);			
			$rootScope.sock.send(json);			
			
			scrollbox = $('#ListViewContent');		
			//var scroll_height = $(scrollbox).outerHeight() * 3;							
			var scroll_height = $(scrollbox)[0].scrollHeight;		
			$(scrollbox).stop().animate({ scrollTop: scroll_height }, 'slow');			
	};
	
	var promise = $q(function(resolve, reject) {
		$scope.getChatHistory();
	}).then(callEmit);
	
	var callEmit = function()
	{
		
	};
	
	//set the scrollBox after messages updated
	var setScrollBox = function(data)
    {
		scrollbox = $('#ListViewContent');
		if($(scrollbox).length > 0)
		{	
			scrollbox[0].onscroll = function() {
				// check scroll position
				if (scrollbox[0].scrollTop == 0 && !$scope.loading && $scope.messages.length > 0) {
					$scope.loading = true;
				}
				
				$scope.loading = false;
				//addMessages(data);//data.items
				
				// kill watcher
				$timeout(function() {
					scrollWatch();
				}, 100, false);
				
				// no more chats
				if (version < 0)
					scrollbox[0].onscroll = null;
			};
		}
    };
    
	// pull chat history from service
	chatService.getChatHistory().then(function(data) {
		$scope.messages = data;	
	    setScrollBox(data);	
	    
		$scope.loading = false;			
	});
    
	//pull the new messages from the service 
	chatService.getChatMessage().then(function(data) {
		var message = data;
		message.id = message.message_id;
		var is_in = false; 
		
		if($scope.messages.length > 0)
		{
			$.each($scope.messages, function(){				
				if($(this)[0].id == message.id)
					is_in = true;
			});
			
		}
		
		if(!is_in)
		{
			if($scope.messages.length == 0)
				$scope.messages[0] = message;
			else
				$scope.messages.push(message);								
		}		
		setScrollBox(data);
		$scope.$safeApply();
	});	
  	
	$scope.$watch('chat.query', function(data) {
		// jump to bottom on search clear
		if (!data || data == '')
		{
			scrollbox = $('#ListViewContent');
			var scroll_height = $(scrollbox).outerHeight() * 4;			
			$(scrollbox).animate({ scrollTop: scroll_height }, 'slow');		
		}	
			
	});
	
	$scope.sendMessage = function() {
		if ($scope.chat.message == '')
			return;
			
		// alert
		if ($scope.showAlerts) {
			httpService.sendAction('queues', 'broadcastMessage', {
				queueId: chat.targetId,
				plain: $scope.chat.message,
				xhtml: $scope.chat.message,
				status: $scope.chat.status,
				clientId: ''
			});
		}
		// normal chat
		else {			
			var msg = $scope.chat.message;					
			var myObj = {};
			var body = {};
			var chatType = "user";
			var targetId = contactId;
			
			if ($routeParams.groupId) {
				chatType = "group";
				targetId = $routeParams.groupId;
			}	
			
			targetId = targetId.toString();
			myObj.reqType = "chat/postMessage";
			myObj.ts = parseInt(new Date().getTime(),10);
			myObj.sender = "U:" + server_id + ":" + my_id;
			body.chatType = chatType;//"user";
			body.targetId = targetId;//contactId;
			body.message = msg;
			body.serverId = server_id;
			body.senderId = my_id;
			var authInfo = {};
			authInfo.username = username;
			authInfo.token = $rootScope.token;
			
			myObj.body = JSON.stringify(body);
			myObj.authInfo = JSON.stringify(authInfo);	
			var json = JSON.stringify(myObj);
			$rootScope.sock.send(json);			
		}		
		
		$scope.chat.message = '';		
		storageService.saveChatMessage(chat.targetId);			
		$('#ChatMessageText').css('height', '1px');
		
		scrollbox = $('#ListViewContent');
		var scroll_height = $(scrollbox).outerHeight() * 4;			
		$(scrollbox).animate({ scrollTop: scroll_height }, 'slow');			
		// play sfx
		phoneService.playSound("sent");
		return false;
	};
	
	$scope.searchChat = function(increment) {
		var spans = document.querySelectorAll(".highlighted");
			
		if ($scope.chat.query != '' && spans.length > 0) {				
			var searchIndex = -1;
			
			for (var i = 0, len = spans.length; i < len; i++) {
				if (spans[i].className.indexOf('found') != -1)
					searchIndex = i;
				
				spans[i].className = 'highlighted';
			}
			
			searchIndex += increment;
			
			// loop
			if (searchIndex < 0)
				searchIndex = spans.length - 1;
			else if (searchIndex >= spans.length)
				searchIndex = 0;
				
			spans[searchIndex].className = 'highlighted found';
			spans[searchIndex].scrollIntoView();
		}
	};


	// apply name and avatar and push to view
	var addMessages = function(data) {
		for (var i = 0, len = data.length; i < len; i++) {
			data[i].fullProfile = contactService.getContact(data[i].senderId);			
			
			if (data[i].type && data[i].type == 'f.conversation.chat.group.remove'){
				data[i].message = "<strong>Goodbye " + data[i].data.groupId + "!</strong><br/>" + data[i].message;
			}
			
			// keep track of which messages should be on screen based on date
			if (data[i].created && data[i].created < cutoff)
				cutoff = data[i].created;
			
			// update html per message
			data[i].message = $filter('chatify')(data[i].message);
			
			$scope.messages.push(data[i]);
		}
		
		var mLen = $scope.messages.length;
		var dups = [];
		for(var m = 0; m < mLen; m++)
	    {
			var idA = $scope.messages[m]; 
			for(var n = m+1; n < mLen; n++)
			{
				idB = $scope.messages[n];
				if(idA == idB)
					dups.push(n);
			}	
	    }
	    
		var dLen = dups.length;
		for(var d = 0; d < dLen; d++)
		{
			var idx = dups[d];
			$scope.messages.splice(idx, 1);
		}	
	
	};
	
	$scope.getMonth = function(num)
	{
		switch(num){
		case 0: return 'January';	      			
		case 1: return 'February';
		case 2: return 'March';
		case 3: return 'April';
		case 4: return 'May';
		case 5: return 'June';
		case 6: return 'July';
		case 7: return 'August';
		case 8: return 'September';
		case 9: return 'October'
		case 10:return 'November';
		case 11:return 'December'; 
		}
	};
	
	$scope.getTime = function(created)
	{
		var d = new Date(0);
		d.setUTCSeconds(created);
		var month = $scope.getMonth(d.getMonth());
		var date = d.getDate();
		var hour = d.getHours();
		var pm_am = hour < 11 ? 'am' : 'pm';
		hour = hour < 10 ? '0'+hour : hour > 12 ? (hour - 12): hour;
		var minutes = d.getMinutes();
		minutes = minutes < 10 ? '0' + minutes : minutes;
		
		return (hour + ':' + minutes + ' ' + pm_am);
	};
	
	$scope.getDate = function(created)
	{
		var d = new Date(0);
		d.setUTCSeconds(created);
		var month = $scope.getMonth(d.getMonth());
		var date = d.getDate();
		
		return (month +' '+date);
	}

	$scope.nameDisplay = function(message, index){
		var curMsg = $scope.$parent.filteredMessages[index];
		var curMsgDate = new Date(0);
		curMsgDate.setUTCSeconds(curMsg.created); 
		//var curMsgDate = new Date(curMsg.created);
		var prvMsg;
		if (index !== 0){
			prvMsg = $scope.$parent.filteredMessages[index-1];
			var prvMsgDate = new Date(0);
			prvMsgDate.setUTCSeconds(prvMsg.created);
		}
		// if very 1st message --> display name
		if (index === 0){
			return true;
		} else {
			if(curMsgDate && prvMsgDate){
		        var curHour = parseInt(moment(curMsgDate).format('H mm').split(' ')[0]);
		        var prvHour = parseInt(moment(prvMsgDate).format('H mm').split(' ')[0]);
		        var hourDiff = curHour - prvHour;
	        // if same owner on same day + w/in 2hrs 59 min -> do not display name/avatar/time
				if (curMsgDate.getDate() === prvMsgDate.getDate() && curMsg.senderId == prvMsg.senderId && hourDiff < 3){
					return false;
				} else {
					// otherwise display
					return true;
				}
			}
		}
	};

	$scope.$on("$destroy", function() {
		scrollbox.onscroll = null;
		scrollbox = null;
		
		// save message for later
		storageService.saveChatMessage(chat.targetId, $scope.chat.message);
    });	
}]);
