hudweb.controller('ChatController', ['$scope', '$rootScope', 'HttpService', '$routeParams', 'ContactService', 'PhoneService', '$timeout', '$location', '$filter', 'SettingsService', 'StorageService', 'NtpService', '$http','$analytics', function($scope, $rootScope, httpService, $routeParams, contactService, phoneService, $timeout, $location, $filter, settingsService, storageService, ntpService, $http,$analytics) {
	"use strict";
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
	var playChatSound = false;
	var cutoff = ntpService.getServerTime();
	var scrollbox = {};
	var chat = {}; // internal controller data
	var gaAudience;
	var dropboxScriptTag;
	var oneDriveScriptTag;
	var elementExists;
	var request;

	
	$scope.chat = this; // ng model data
	$scope.upload = {};
	$scope.loading = true;
	$scope.showAlerts = false;
	$scope.enableChat = true;
	$scope.filteredMessages = [];
	$scope.messages = [];
	$scope.upload_time = 0;	
	$scope.upload_progress = 0;
	$scope.chat.attachmentItems;
	$scope.chat.showBG;

	//google analytics track page views
	var chatPath = $location.path();
	
	var contactChat = chatPath.indexOf("contact");
	var queueChat = chatPath.indexOf("queue");
	var groupChat = chatPath.indexOf("group");
	var conferenceChat = chatPath.indexOf("conference");

	if(groupChat != -1){
		$analytics.pageTrack('group/chat');
	}
	else if(queueChat != -1){
		$analytics.pageTrack('queue/chat');
	}
	else if(conferenceChat != -1){
		$analytics.pageTrack('conference/chat');
	}
	else if(contactChat != -1){
		$analytics.pageTrack("contact/chat");
	}	

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

		function formatBytes(bytes,decimals) {
		   if(bytes == 0) return '0 Byte';
		   var k = 1000;
		   var dm = decimals + 1 || 3;
		   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		   var i = Math.floor(Math.log(bytes) / Math.log(k));
		   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
		};

	var getURL = function(action){
	    var url = 
	       action
	      + '?callback=JSON_CALLBACK'
	      + '&fonalityUserId=' + $rootScope.myPid.split('_')[1]
	      + '&serverId=' + $rootScope.meModel.server_id
	      + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
	      + '&authToken=' + localStorage.authTicket;
	    
	    return url;
	};

	var createDropboxTag = function(success, passedInData){
    dropboxScriptTag = document.createElement('script');
    dropboxScriptTag.setAttribute('src', 'https://www.dropbox.com/static/api/2/dropins.js');
    dropboxScriptTag.setAttribute('type', 'text/javascript');
    dropboxScriptTag.setAttribute('id', 'dropboxjs');
    // if post request successfully returns key -> use as dropbox key otherwise use hardcoded key located in properties.js config file
    if (success && passedInData.app_key){
  		dropboxScriptTag.setAttribute('data-app-key', passedInData.app_key);
    }
    else{
    	dropboxScriptTag.setAttribute('data-app-key', fjs.CONFIG.DROPBOX_APP_TOKEN);
    }

    // don't add the script tag multiple times if switching back and forth b/w chat controller
    elementExists = document.getElementById("dropboxjs");
    if (!elementExists)
    	document.body.appendChild(dropboxScriptTag);
	};

  $http.post(fjs.CONFIG.SERVER.ppsServer + getURL('dropbox/settings')).success(function(data){
    createDropboxTag(true, data);
  }).error(function(err){
    createDropboxTag(false);
  });

	var options = {

    // Required. Called when a user selects an item in the Chooser.
    success: function(files) {
        //alert("Here's the file link: " + files[0].link);
        for(var i = 0;i<files.length;i++){
       var fileName = files[i].name;
       fileName = fileName + "";
       var fileLink = files[i].link;
       fileLink = fileLink + "";
       var fileBytes = files[i].bytes;
       fileBytes = formatBytes(fileBytes);
       fileBytes = fileBytes + "";
        httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: ' ',
				// message: files[0].link,
				data: '{"attachment":[{"fileLink":true, "dropbox":true, "dropboxFile":"'+fileName+'","dropboxLink":"'+fileLink+'","fileBytes":"'+fileBytes+'"}]}'
			});
    	}
        
        playChatSound = true;
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
    multiselect: true // or true

    // Optional. This is a list of file extensions. If specified, the user will
    // only be able to select files with these extensions. You may also specify
    // file types, such as "video" or "images" in the list. For more information,
    // see File types below. By default, all extensions are allowed.
	};

	$scope.chooseDropbox = function(){
		Dropbox.choose(options);
		$scope.determineAudience();
		sendGoogleAnalytic('DropBox');
	};

	//GOOGLE DRIVE file share
   $scope.onLoaded = function () {
     console.log('Google Picker loaded!');
     $scope.determineAudience();
		sendGoogleAnalytic('GoogleDrive');
   };

   $scope.onPicked = function (docs) {
   	for (var i = 0; i< docs.length; i++ ){
   	var fileName = docs[i].name;
       fileName = fileName + "";
       var fileLink = docs[i].url;
       fileLink = fileLink + "";
       var fileBytes = docs[i].sizeBytes;
       fileBytes = formatBytes(fileBytes);
       fileBytes = fileBytes + "";
    httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: ' ',
				// message: files[0].link,
				data: '{"attachment":[{"fileLink":true,"googleDrive":true, "dropboxFile":"'+fileName+'","dropboxLink":"'+fileLink+'","fileBytes":"'+fileBytes+'"}]}'
			});
		}
   	 
   	 playChatSound = true;
   };

   $scope.onCancel = function () {
     console.log('Google picker close/cancel!');
   };

   // BOX file share 
  var boxOptions = {
    clientId: fjs.CONFIG.BOX_CLIENT_ID,
    linkType: 'shared',
    multiselect: true
  };

  var boxSelect = new BoxSelect(boxOptions);

  boxSelect.success(function(data){
  	for(var i=0; i<data.length;i++){
    var fileName = data[i].name;
    fileName = fileName + "";
    var fileLink = data[i].url;
    fileLink = fileLink + "";
    // file size not provided if linkType === 'shared'
    var fileBytes = data[i].size;
    fileBytes = formatBytes(fileBytes);
    fileBytes = fileBytes + "";
    httpService.sendAction('streamevent', 'sendConversationEvent', {
      type: chat.type,
      audience: chat.audience,
      to: chat.targetId,
      message: ' ',
      data: '{"attachment":[{"fileLink":true,"box":true, "dropboxFile":"'+fileName+'","dropboxLink":"'+fileLink+'","fileBytes":"'+fileBytes+'"}]}'
    });
		}
  	
  	playChatSound = true;
  });

  boxSelect.cancel(function(){
    console.log('user cancelled popup');
  });

  $scope.launchBox = function(){
    boxSelect.launchPopup();
    $scope.determineAudience();
		sendGoogleAnalytic('Box');
  };

  $scope.convertBoxLink = function(attch){
    console.log('attch - ', attch);
    return attch.boxLink;
  };   

  //One Drive
   var pickerOptions = {
   	  clientId: "2739a626-afb6-4926-bd88-da278fa95638",
	  action: "share",
	  multiSelect: true,
	  openInNewWindow: true,
	  advanced: {
	    redirectUri: document.location.origin + "/oneDrive.html",
	  },
	  success: function(files) {

	  	for(var i = 0;i<files.value.length;i++){
  	  	var fileName = files.value[i].name;
	    fileName = fileName + "";
	    var fileLink = files.value[i].permissions[0].link.webUrl;
	    fileLink = fileLink + "";
	    var fileBytes = files.value[i].size;
	    fileBytes = formatBytes(fileBytes);
	    fileBytes = fileBytes + "";

	    httpService.sendAction('streamevent', 'sendConversationEvent', {
	      type: chat.type,
	      audience: chat.audience,
	      to: chat.targetId,
	      message: ' ',
	      data: '{"attachment":[{"fileLink":true,"oneDrive":true, "dropboxFile":"'+fileName+'","dropboxLink":"'+fileLink+'","fileBytes":"'+fileBytes+'"}]}'
	    });
	    
	}
	  	
	  	playChatSound = true; 

	},
	  cancel: function() {  },
	  error: function(e) {  }
	};
  $scope.launchOneDrivePicker = function(){
    OneDrive.open(pickerOptions);
      $scope.determineAudience();
		sendGoogleAnalytic('OneDrive');
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
			if ($scope.messages[i].data && $scope.messages[i].data.attachment && $scope.messages[i].data.attachment[0].dropbox != true && $scope.messages[i].data.attachment[0].box != true && $scope.messages[i].data.attachment[0].googleDrive != true && $scope.messages[i].data.attachment[0].oneDrive != true) {
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
		if (attachment && attachment.oneDrive)
			return 'img/OneDrive-logo-90.png';
		else if (attachment && attachment.box)
			return 'img/box_logo-90.png';
		else if(attachment && attachment.googleDrive)
			return 'img/GoogleDrive-logo-90.png';
		else if(attachment && attachment.dropbox)
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

	$scope.$on('sameUserFileShareIconClick', function(data){
		$scope.chat.attachmentItems = true;
	});

	$rootScope.showAttachmentsBoxWithBG = function(audience){
		// for clicking on fileshare icon on avatar-hover
		$scope.chat.attachmentItems = true;
		$scope.chat.showBG = true;
		gaAudience = audience;
	};	

	// determine access point for google analytics purposes
	$scope.determineAudience = function(){
		$scope.chat.showBG = false;
		gaAudience = $location.path().split('/')[1];
	};

	var sendGoogleAnalytic = function(type){
		if (type == "Computer")
			var finalEventAction = "Attachment";	
		else if(type == "DropBox")
			var finalEventAction = "DropBox";
		else if(type == "Box")
			var finalEventAction = "Box";
		else if(type == "OneDrive")
			var finalEventAction = "OneDrive";
		else if(type == "GoogleDrive")
			var finalEventAction = "GoogleDrive";

		var gaObj = {
			hitType: 'event',
			eventCategory: 'Sharing',
			eventAction: finalEventAction,
			eventLabel: type + '_Share_via_access_point_' + gaAudience
		};
		// send object to google analytics api
		ga('send', gaObj);
	};

	
	
	//this is needed to clear ng flow cache files for flow-files-submitted because ng flow will preserve previous uploads so the upload attachment will not receive it
	$scope.flow_cleanup = function($files){
		$scope.upload.flow.cancel();
	};

	$scope.uploadAttachments = function($files){
      	var timestamp = ntpService.calibrateTime(new Date().getTime());
		if($scope.showAlerts || !$scope.enableChat){
			return;
		}
      	
		var fileList = [];
		
		for(var i = 0, iLen = $files.length; i < iLen; i++){
      		fileList.push($files[i].file);
			
      	}
      	var fileSize = fileList[0].size;
      	if(fileSize > 10485760){
      		$scope.messages.push({
				message:"<strong>Your attachment exceeds the 10MB file size limit</strong>",
				fullProfile: contactService.getContact($rootScope.myPid),
				created: timestamp,
				xpid: timestamp
			});
			setTimeout(function() {
			scrollbox.scrollTop = scrollbox.scrollHeight;
		}, 1);
		
      		
      	}
      	else{
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
	}
		// local upload -> send to GA
		sendGoogleAnalytic('Computer');
		
		playChatSound = true;
	};
	
	// keep scrollbar at bottom until chats are loaded
	var scrollWatch = $scope.$watch(function() {
		if (scrollbox.scrollHeight)
			scrollbox.scrollTop = scrollbox.scrollHeight;
	});
	
	var conversationType = chat.type == 'f.conversation.chat' ? 'f.conversation' : chat.type;

	var chatDelay = $timeout(function() {
		httpService.getChat(chat.audience+'s', conversationType, chat.targetId).then(function(data) {
			// make sure we're still on the same page
			if ($location.path().indexOf(chat.targetId) == -1)
				return;
			
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
	}, 500, false);

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
			
			if(data[i].data && data[i].data.attachment && data[i].data.attachment.length > 0 && playChatSound)
			{	
				if(incoming)
					phoneService.playSound("received");
				else
					phoneService.playSound('sent');		
					
				playChatSound = false;			
			}
		}

		if (found.length > 0) {
			addMessages(found);
			
			// only play sound once per sync
			// isInFocus is required to avoid conflicts with notification sfx
			if (!soundDelay && phoneService.getBrowserOnFocus() && incoming)
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

	$scope.trackMe = function(){
		ga('send', 'event', {eventCategory:'Search', eventAction:'Access', eventLabel: "From Center Column Chat"});
	};
	
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
		$timeout.cancel(chatDelay);
		
		scrollbox.onscroll = null;
		scrollbox = null;
		
		// save message for later
		storageService.saveChatMessage(chat.targetId, $scope.chat.message);
    });	
}]);
