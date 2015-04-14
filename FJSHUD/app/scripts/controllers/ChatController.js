hudweb.controller('ChatController', ['$scope','HttpService', '$routeParams', 'UtilService', 'ContactService', 'PhoneService','$interval', '$timeout','SettingsService',
	function($scope,httpService, $routeParams,utilService,contactService,phoneService,$interval, $timeout,settingsService) {

	var version = 0;
	var scrollbox = {};
	var chat = {};
	var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
	
	$scope.upload = {};
	$scope.alert = {};
	$scope.loading = true;
	$scope.displayHeader = true;
	
	// set chat data
	if ($routeParams.contactId) {
		chat.name = $scope.contact.displayName;
		chat.audience = 'contact';
		chat.targetId = $routeParams.contactId;
		chat.type = 'f.conversation.wall';
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
			$scope.alert.status = 3;
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
		
		for(i = 0; i < $scope.messages.length; i++){
			if ($scope.messages[i].data && $scope.messages[i].data.attachment) {
				var attachments = $scope.messages[i].data.attachment;
				
				for(a = 0; a < attachments.length; a++) {
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
		
		for (key in data) {
			// prevent duplicates
			var dupe = false;
			
			for (i = 0; i < $scope.messages.length; i++) {
				if (data[key].xpid == $scope.messages[i].xpid) {
					dupe = true;
					break;
				}
			}

			if (dupe) continue;
			
			var from = data[key].from.replace('contacts:', '');
			
			if (settingsService.getSetting('hudmw_chat_sounds') == "true"){
				if (from == $scope.meModel.my_pid){
					if (settingsService.getSetting('hudmw_chat_sound_sent') == 'true')
						phoneService.playSound("sent");
				}
				else{
					if(settingsService.getSetting('hudmw_chat_sound_received') == 'true')
						phoneService.playSound("received");
				}
			}

			// only attach messages related to this page
			var context = data[key].context.split(":")[1];
			
			if (data[key].type == chat.type && context == chat.targetId) {
				$scope.messages.push(data[key]);
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
	
	$scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		// alert
		if ($scope.showAlerts) {
			httpService.sendAction('queues', 'broadcastMessage', {
				queueId: chat.targetId,
				plain: this.message,
				xhtml: this.message,
				status: $scope.alert.status,
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
			
		if ($scope.query != '' && spans.length > 0) {				
			var searchIndex = -1;
			
			for (i = 0; i < spans.length; i++) {
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

	$scope.formatDate = function(message){
		var date = new Date(message.created);
		var today = new Date();
		var dateString = "";
		dateString = Months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

		if (date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
			if (date.getDate() == today.getDate()){
				dateString = "today";
			} else if (date.getDate() == today.getDate() - 1){
				dateString = "yesterday";
			} 
		}

		return dateString;
	};	

	// apply name and avatar
	var addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function() {
			for (i = 0; i < $scope.messages.length; i++) {
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

	$scope.hideDisplay = function(message, index){
		var currentMessage = $scope.messages[index];
		var previousMessage;
		if(index != 0){
			previousMessage = $scope.messages[index - 1];
		}
		
		// if current msg's owner is the SAME AS owner of previous msg --> return true upon ng-hide --> do NOT display
		if(previousMessage){
			if (currentMessage.from === previousMessage.from){
				return true;
			}	
		}
		
		return false;
	};

	$scope.$on("$destroy", function() {
		$interval.cancel(chatLoop);
    });	
}]);