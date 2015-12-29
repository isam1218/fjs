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
	$scope.my_id = $rootScope.meModel.my_pid;//.split('_')[1];
	var my_id = $rootScope.meModel.my_pid;
	var contactId = $routeParams.contactId;	
	var server_id = $rootScope.meModel.server_id;
		
	// set chat data
	if ($routeParams.contactId) {
		chat.name = $scope.contact.displayName;
		chat.audience = 'contact';
		chat.targetId = $routeParams.contactId;
		chat.type = 'f.conversation.chat';
		chat.attachmentType = 'f.conversation.wall';
		
		$scope.enableChat = settingsService.isEnabled($scope.contact.permissions, 8);
	}
	else if ($routeParams.conferenceId) {
		chat.name = $scope.conference.name;
		chat.audience = 'conference';
		chat.targetId = $routeParams.conferenceId;
		chat.type = 'f.conversation.chat';
		chat.attachmentType = 'f.conversation.wall';
		
		$scope.enableChat = $scope.conference.status.isMeJoined;
		
		// unfortunately, we'll need to watch this value
		$scope.$watch('conference.status.isMeJoined', function(val) {
			$scope.enableChat = val;
		});
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
			//scrollbox.scrollTop = scrollbox.scrollHeight;			
			var scroll_height = $(scrollbox).outerHeight() * 3;//2.5;			
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
			
	        myObj.reqType = "chat/getChatMessageHistoryForSession";
			//myObj.ts = parseInt(d.getTime().toString(), 10);			
			myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815
			body.chatType = "user";
			body.userId = my_id;
			body.targetId = contactId;//contact Id//username __5549_7042
			myObj.body = JSON.stringify(body);
			var json = JSON.stringify(myObj);			
			//$scope.sock.send(json);
			$rootScope.sock.send(json);
			
			scrollbox = $('#ListViewContent');
			var scroll_height = $(scrollbox).outerHeight() * 3;//2.5;			
			$(scrollbox).animate({ scrollTop: scroll_height }, 'slow');			
	};
	
	var promise = $q(function(resolve, reject) {
		$scope.getChatHistory();
	}).then(callEmit);
	
	var callEmit = function()
	{
		
	};
	
	//set the scrollBox after messages updated
	var setScrollBox = function()
    {
		scrollbox = document.getElementById('ListViewContent');
		scrollbox.onscroll = function() {
			// check scroll position
			if (scrollbox.scrollTop == 0 && !$scope.loading && $scope.messages.length > 0) {
				$scope.loading = true;
				
				// ping server
				//httpService.getChat(chat.audience+'s', chat.type, chat.targetId, version).then(function(data) {
				////////////////////////////////////////////////////////////////////////// updates
					//version = data.h_ver;
				
				//	$scope.loading = false;			
				//	addMessages(data);//data.items

					// bump scroll down
					//if (scrollbox.scrollTop == 0)
				//		scrollbox.scrollTop = 100;
					
					// end of history
					//if (version < 0)
					//	scrollbox.onscroll = null;
				//});
				///////////////////////////////////////////////////////////////////////////////////	updates			
			}
			
			$scope.loading = false;
			addMessages(data);//data.items
			
			// kill watcher
			$timeout(function() {
				scrollWatch();
			}, 100, false);
			
			// no more chats
			if (version < 0)
				scrollbox.onscroll = null;
		};
    };
    
	// pull chat history from service
	chatService.getChatHistory().then(function(data) {
		$scope.messages = data;	
	    setScrollBox();	
	    
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
		setScrollBox();
		$scope.$safeApply();
	});	
    
	/*httpService.getChat(chat.audience+'s', conversationType, chat.targetId).then(function(data) {
		version = data.h_ver;
		scrollbox = document.getElementById('ListViewContent');
			
		scrollbox.onscroll = function() {
			// check scroll position
			if (scrollbox.scrollTop == 0 && !$scope.loading && $scope.messages.length > 0) {
				$scope.loading = true;
				
				// ping server
				httpService.getChat(chat.audience+'s', chat.type, chat.targetId, version).then(function(data) {
					version = data.h_ver;
				
					$scope.loading = false;			
					addMessages(data.items);

					// bump scroll down
					if (scrollbox.scrollTop == 0)
						scrollbox.scrollTop = 100;
					
					// end of history
					if (version < 0)
						scrollbox.onscroll = null;
				});
			}
		};
		
		$scope.loading = false;
		addMessages(data.items);
		
		// kill watcher
		$timeout(function() {
			scrollWatch();
		}, 100, false);
		
		// no more chats
		if (version < 0)
			scrollbox.onscroll = null;
	});

   	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		var found = [];
		var incoming = false;
		
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			// prevent duplicates
			var dupe = false;
			
			for (var m = 0, mLen = $scope.messages.length; m < mLen; m++) {
				if (data[i].xpid == $scope.messages[m].xpid) {
					// attachment was deleted
					if (data[i].xef001type == 'delete') {
						$scope.messages.splice(m, 1);
						mLen--;
					}
					
					dupe = true;
					break;
				}
			}

			if (dupe || data[i].xef001type == 'delete') 
				continue;		

			// only attach messages related to this page
			var context = data[i].context.split(":")[1];
			var streamType = data[i].type.replace('.auto', '').replace('.group.remove', '');

			if ((streamType == chat.type || streamType == chat.attachmentType) && context == chat.targetId && data[i].created >= cutoff) {
				var from = data[i].from.replace('contacts:', '');
			
				// mark as incoming				
				if (from != $scope.meModel.my_pid)
					incoming = true;
				
				found.push(data[i]);				
			}
		}

		if (found.length > 0) {
			addMessages(found);
			
			// only play sound once per sync
			// isInFocus is required to avoid conflicts with notification sfx
			if (phoneService.isInFocus() && incoming)
				phoneService.playSound("received");
			
			// jump to bottom if new messages were found
			$timeout(function() {
				scrollbox.scrollTop = scrollbox.scrollHeight;
			}, 100, false);
		}
	});*/
	
	$scope.$watch('chat.query', function(data) {
		// jump to bottom on search clear
		if (!data || data == '')
		{
			//scrollbox.scrollTop = scrollbox.scrollHeight;
			var scroll_height = $(scrollbox).outerHeight() * 3;//2.5;			
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
			/*
			httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: $scope.chat.message
			});*/
			var msg = $scope.chat.message;			
			var d = new Date();
			var myObj = {};
			var body = {};
			
			myObj.reqType = "chat/postMessage";
			//myObj.ts = parseInt(d.getTime().toString(), 10);
			myObj.sender = "U:" + server_id + ":" + my_id;
			body.chatType = "user";
			body.targetId = contactId;
			body.message = msg;
			body.serverId = server_id;
			body.senderId = my_id;
			myObj.body = JSON.stringify(body);
			var json = JSON.stringify(myObj);
			//$scope.sock.send(json);
			$rootScope.sock.send(json);
		}		
		
		$scope.chat.message = '';		
		storageService.saveChatMessage(chat.targetId);			
		$('#ChatMessageText').css('height', '1px');
		scrollbox = $('#ListViewContent');
		var scroll_height = $(scrollbox).outerHeight() * 3;//2.5;			
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
			data[i].fullProfile = contactService.getContact(data[i].from.replace('contacts:', ''));			
			
			if (data[i].type == 'f.conversation.chat.group.remove'){
				data[i].message = "<strong>Goodbye " + data[i].data.groupId + "!</strong><br/>" + data[i].message;
			}
			
			// keep track of which messages should be on screen based on date
			if (data[i].created < cutoff)
				cutoff = data[i].created;
			
			// update html per message
			data[i].message = $filter('chatify')(data[i].message);
			
			$scope.messages.push(data[i]);
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
				if (curMsgDate.getDate() === prvMsgDate.getDate() && curMsg.sender_id == prvMsg.sender_id && hourDiff < 3){
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
