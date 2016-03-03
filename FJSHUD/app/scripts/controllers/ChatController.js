hudweb.controller('ChatController', ['$scope', '$rootScope', 'HttpService', '$routeParams', 'ContactService', 'PhoneService', '$timeout', '$location', '$filter', 'SettingsService', 'StorageService', 'NtpService', function($scope, $rootScope, httpService, $routeParams, contactService, phoneService, $timeout, $location, $filter, settingsService, storageService, ntpService) {
	
	// redirect if not allowed
	if ($scope.$parent.chatTabEnabled !== undefined && $scope.$parent.chatTabEnabled === false) {
		// only for groups and queues
		if ($routeParams.groupId)
			$location.path('group/' + $routeParams.groupId + '/members');
		else if ($routeParams.queueId && $routeParams.route == 'chat')
			$location.path('queue/' + $routeParams.queueId + '/agents');
	}

	var version = 0;
	var soundDelay = true;
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
	$scope.upload_time = 0;	
	$scope.upload_progress = 0;
	$scope.attachmentItems;
	$scope.showBG;

	httpService.get_upload_progress().then(function(data){
		$scope.upload_progress = data.progress;
		request = data.xhr;	
	},function(error){},function(data){
		$scope.upload_progress = data.progress;
		request = data.xhr;	
		if(data.started){
			$scope.upload_time = new Date().getTime();
		}
		if(data.progress == 100){
			$timeout(function(){$scope.upload_progress = 0;},1000);
		}	
		
	});

	options = {

    // Required. Called when a user selects an item in the Chooser.
    success: function(files) {
        //alert("Here's the file link: " + files[0].link);
       var fileName = files[0].name;
       fileName = fileName + "";
       var fileLink = files[0].link;
       fileLink = fileLink + "";
       var fileBytes = files[0].bytes;
       fileBytes = formatBytes(fileBytes);
       fileBytes = fileBytes + "";
        httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: '',
				// message: files[0].link,
				data: '{"attachment":[{"dropbox":true, "dropboxFile":"'+fileName+'","dropboxLink":"'+fileLink+'","fileBytes":"'+fileBytes+'"}]}'
			});
       
    },

    // Optional. Called when the user closes the dialog without selecting a file
    // and does not include any parameters.
    cancel: function() {

    },

    // Optional. "preview" (default) is a preview link to the document for sharing,
    // "direct" is an expiring link to download the contents of the file. For more
    // information about link types, see Link types below.
    linkType: "preview", // or "direct"

    // Optional. A value of false (default) limits selection to a single file, while
    // true enables multiple file selection.
    multiselect: false, // or true

    // Optional. This is a list of file extensions. If specified, the user will
    // only be able to select files with these extensions. You may also specify
    // file types, such as "video" or "images" in the list. For more information,
    // see File types below. By default, all extensions are allowed.
    extensions: ['.pdf', '.doc', '.docx','.zip','.txt', '.png', '.jpg', '.jpeg', '.gif'],
	};

	function formatBytes(bytes,decimals) {
	   if(bytes == 0) return '0 Byte';
	   var k = 1000;
	   var dm = decimals + 1 || 3;
	   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	   var i = Math.floor(Math.log(bytes) / Math.log(k));
	   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	};

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
					if(attachments.dropbox == true)
						break;
				}
			}
		}
		
		$scope.showOverlay(true, 'FileShareOverlay', {
			downloadables: downloadables,
			current: current
		});
	};

	$scope.getAttachment = function(attachment){
		// show image as is
		if(attachment && attachment.dropbox == true)
			return 'img/dropbox-logo-90.png';
		else if (attachment && attachment.fileName.match(/\.(png|jpg|jpeg|gif)$/i))
			return httpService.get_attachment(attachment.url,attachment.fileName);
		// show document image
		else if (attachment && attachment.fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|js)$/i))
			return 'img/XIcon-PreviewDocument.png';
		// show mysterious image
		else
			return 'img/XIcon-UnknownDocument.png';
	};

	$rootScope.showAttachmentsBoxWithBG = function(){
		// for clicking on fileshare icon on avatar-hover
		$scope.attachmentItems = true;
		$scope.showBG = true;
	};	

	$scope.chooseDropbox = function(){
		Dropbox.choose(options);
	};
	
	
	//this is needed to clear ng flow cache files for flow-files-submitted because ng flow will preserve previous uploads so the upload attachment will not receive it
	$scope.flow_cleanup = function($files){
		$scope.upload.flow.cancel();
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
			scrollbox.scrollTop = scrollbox.scrollHeight;
	});
	
	var conversationType = chat.type == 'f.conversation.chat' ? 'f.conversation' : chat.type;

	httpService.getChat(chat.audience+'s', conversationType, chat.targetId).then(function(data) {
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
		
		// sync with web worker in case history is delayed
		httpService.getFeed('streamevent');
		
		soundDelay = setTimeout(function() {
			soundDelay = false;
		}, 1000);
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
				else if (data[i].data && data[i].data.timestamp && data[i].data.timestamp == $scope.messages[m].xpid) {
					// update temp message
					$scope.messages[m].xpid = data[i].xpid;
					$scope.messages[m].created = data[i].created;
					data[i].data = {};
					
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
			if (!soundDelay && phoneService.isInFocus() && incoming)
				phoneService.playSound("received");
			
			// jump to bottom if new messages were found
			$timeout(function() {
				scrollbox.scrollTop = scrollbox.scrollHeight;
			}, 100, false);
		}
	});
	
	$scope.$watch('chat.query', function(data) {
		// jump to bottom on search clear
		if (!data || data == '')
			scrollbox.scrollTop = scrollbox.scrollHeight;
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
			var timestamp = ntpService.calibrateTime(new Date().getTime());
			
			// send to server
			httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: $scope.chat.message,
				data: '{"timestamp":' + timestamp + '}'
			});
			
			// immediately show temp message
			$scope.messages.push({
				message: $filter('chatify')($scope.chat.message.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;")),
				fullProfile: contactService.getContact($rootScope.myPid),
				created: timestamp,
				xpid: timestamp
			});
			
			$timeout(function() {
				scrollbox.scrollTop = scrollbox.scrollHeight;
			}, 100, false);
		}
		
		$scope.chat.message = '';
		storageService.saveChatMessage(chat.targetId);		
		document.getElementById('ChatMessageText').style.height = '1px';
		
		// play sfx
		phoneService.playSound("sent");
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

	$scope.nameDisplay = function(message, index){
		var curMsg = $scope.$parent.filteredMessages[index];
		var curMsgDate = new Date(curMsg.created);
		var prvMsg;
		if (index !== 0){
			prvMsg = $scope.$parent.filteredMessages[index-1];
			var prvMsgDate = new Date(prvMsg.created);
		}
		// if very 1st message --> display name
		if (index === 0){
			return true;
		} else {
			if(curMsgDate && prvMsgDate){
        var curHour = curMsgDate.getHours();
        var prvHour = prvMsgDate.getHours();
        var hourDiff = curHour - prvHour;
        // if same owner on same day + w/in 2hrs 59 min -> do not display name/avatar/time
				if (curMsgDate.getDate() === prvMsgDate.getDate() && curMsg.fullProfile.xpid == prvMsg.fullProfile.xpid && hourDiff < 3){
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
