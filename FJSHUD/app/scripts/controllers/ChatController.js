hudweb.controller('ChatController', ['$scope','HttpService', '$routeParams', 'ContactService', 'PhoneService','$interval', '$timeout','SettingsService',
	function($scope,httpService, $routeParams,contactService,phoneService,$interval, $timeout,settingsService) {

	var version = 0;
	var scrollbox = {};
	var chat = {}; // internal controller data
	
	$scope.chat = this; // ng model data
	$scope.upload = {};
	$scope.loading = true;
	$scope.displayHeader = true;
	$scope.filteredMessages = [];

	// set chat data
	if ($routeParams.contactId) {
		chat.name = $scope.contact.displayName;
		chat.audience = 'contact';
		chat.targetId = $routeParams.contactId;
		chat.type = 'f.conversation.chat';
	}
	else if ($routeParams.conferenceId) {
		chat.name = $scope.conference.name;
		chat.audience = 'conference';
		chat.targetId = $routeParams.conferenceId;
		chat.type = 'f.conversation.chat';
	}
	else if ($routeParams.groupId) {
		chat.name = $scope.group.name;
		chat.audience = 'group';
		chat.targetId = $routeParams.groupId;
		chat.type = 'f.conversation.chat';
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
		else
			chat.type = 'f.conversation.chat';
	}
	
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
		return httpService.get_attachment(url,fileName);
	};
	

	$scope.uploadAttachments = function($files){
      	fileList = [];
		
      	fileList.push($files.file);
		
        var data = {
            'action':'sendWallEvent',
            'a.targetId': $routeParams.contactId,
            'a.type':'f.conversation.chat',
            'a.xpid':"",
            'a.archive':0,
            'a.retainKeys':"",
            'a.message': '',
            'a.callback':'postToParent',
            'a.audience':chat.audience,
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "2_5",
            "_archive":0,
        };
		
        httpService.upload_attachment(data,fileList);
		
        $scope.upload.flow.cancel();
    
    };
	
	// keep scrollbar at bottom until chats are loaded
	var scrollWatch = $scope.$watch(function(scope) {
		if (scrollbox.scrollHeight)
			scrollbox.scrollTop = scrollbox.scrollHeight;
	});
	
	httpService.getChat(chat.audience+'s', chat.type, chat.targetId).then(function(data) {
		version = data.h_ver;
		scrollbox = document.getElementById('ListViewContent');
		
		$scope.loading = false;
		$scope.messages = data.items;
		addDetails();
		
		// kill watcher
		$timeout(function() {
			scrollWatch();
		}, 100);
		
		// no more chats
		if (version < 0)
			$interval.cancel(chatLoop);
	});

   	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		var found = false;
		
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

			if (dupe) continue;
			
			var from = data[i].from.replace('contacts:', '');
			
			if (settingsService.getSetting('hudmw_chat_sounds') == "true"){
				if (from == $scope.meModel.my_pid){
					if (settingsService.getSetting('hudmw_chat_sound_sent') == 'true')
						phoneService.playSound("sent");
				}
			}

			// only attach messages related to this page
			var context = data[i].context.split(":")[1];
			
			if (data[i].type.replace('.auto', '') == chat.type && context == chat.targetId) {
				$scope.messages.push(data[i]);
				found = true;
			}
		}
		
		if (found) {
			addDetails();
			
			// jump to bottom if new messages were found
			$timeout(function() {
				scrollbox.scrollTop = scrollbox.scrollHeight;
			}, 100);
		}
	});
	
	$scope.$watch('chat.query', function(data) {
		// jump to bottom on search clear
		if (!data || data == '')
			scrollbox.scrollTop = scrollbox.scrollHeight;
	});
	
	$scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		// alert
		if ($scope.showAlerts) {
			httpService.sendAction('queues', 'broadcastMessage', {
				queueId: chat.targetId,
				plain: this.message,
				xhtml: this.message,
				status: $scope.chat.status,
				clientId: ''
			});
		}
		// normal chat
		else {
			httpService.sendAction('streamevent', 'sendConversationEvent', {
				type: chat.type,
				audience: chat.audience,
				to: chat.targetId,
				message: this.message
			});
		}		
		
		this.message = '';
	};

	// look for enter key
	$scope.chatKeypress = function($event) {
		if ($event.keyCode == 13 && !$event.shiftKey) {
			this.sendMessage();
			$event.preventDefault();
		}
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


	// apply name and avatar
	var addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function() {
			for (var i = 0, len = $scope.messages.length; i < len; i++) {
				$scope.messages[i].fullProfile = contactService.getContact($scope.messages[i].from.replace('contacts:', ''));
			}
		});
	};

	var chatLoop = $interval(function() {	
		// check scroll position
		if (!$scope.loading && $scope.messages.length > 0 && scrollbox.scrollTop == 0) {
			$scope.loading = true;
			
			// ping server
			httpService.getChat(chat.audience+'s', chat.type, chat.targetId, version).then(function(data) {
				version = data.h_ver;
			
				$scope.loading = false;
				$scope.messages = data.items.concat($scope.messages);				
				addDetails();

				// bump scroll down
				if (scrollbox.scrollTop == 0)
					scrollbox.scrollTop = 100;
				
				// end of history
				if (version < 0)
					$interval.cancel(chatLoop);
			});
		}
	}, 600);

	$scope.nameDisplay = function(message, index){
		var curMsg = $scope.filteredMessages[index];
		var curMsgDate = new Date(curMsg.created);
		var prvMsg;
		if (index !== 0){
			prvMsg = $scope.filteredMessages[index-1];
			var prvMsgDate = new Date(prvMsg.created);
		}
		// if very 1st message --> display name
		if (index === 0){
			return true;
		} else {
			// if same msg owner on same day  --> do not display
			if (curMsgDate.getDate() === prvMsgDate.getDate() && curMsg.fullProfile.xpid == prvMsg.fullProfile.xpid){
				return false;
			} else {
				// otherwise display
				return true;
			}
		}
	};

	$scope.$on("$destroy", function() {
		$interval.cancel(chatLoop);
    });	
}]);
