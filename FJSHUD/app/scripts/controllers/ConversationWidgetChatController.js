hudweb.controller('ConversationWidgetChatController', ['$scope', '$interval', 'ContactService', 'HttpService', function($scope, $interval, contactService, myHttpService) {
	var version = 0;
	
	$scope.glued = true;
	$scope.loading = true;
    $scope.messages = [];
	$scope.conversationType = 'conversation';
	$scope.enableChat = true;
	$scope.enableFileShare = true;
	
	// get initial messages from server
	myHttpService.getChat('contacts', $scope.contactID).then(function(data) {
		version = data.h_ver;
		
		$scope.loading = false;
		$scope.messages = data.items;		
		addDetails();
	});
	
	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
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
			var to = data[key].to.replace('contacts:', '');
			
			// only attach messages related to this user
			if (from == $scope.contactID || to == $scope.contactID)
				$scope.messages.push(data[key]);
		}
		
		addDetails();
	});
	
	$scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		var data = {
			type: 'f.conversation.chat',
			audience: 'contact',
			to: $scope.contactID,
			message: this.message,
		};
		
		myHttpService.sendAction('streamevent', 'sendConversationEvent', data);
		
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
			// temporarily disable sticky directive
			$scope.glued = false;
				
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
	
	// apply name and avatar
	var addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function(data) {
			for (i = 0; i < $scope.messages.length; i++) {
				for (key in data) {
					if (data[key].xpid == $scope.messages[i].from.replace('contacts:', '')) {
						$scope.messages[i].avatar = data[key].getAvatar(28);
						$scope.messages[i].displayName = data[key].displayName;
						break;
					}
				}
			}
			
			$scope.$safeApply();
		});
	};
	
	var chatLoop = $interval(function() {	
		var scrollbox = document.getElementById('ListViewContent');
	
		// check scroll position
		if (!$scope.loading && $scope.messages.length > 0 && scrollbox.scrollTop == 0) {
			$scope.loading = true;
			
			// ping server
			myHttpService.getChat('contacts', $scope.contactID, version).then(function(data) {
				version = data.h_ver;
			
				$scope.loading = false;
				$scope.messages = data.items.concat($scope.messages);				
				addDetails();

				// bump scroll down
				if (scrollbox.scrollTop == 0)
					scrollbox.scrollTop = 100;
				
				// end of history
				if (version == -1)
					$interval.cancel(chatLoop);
			});
		}
	}, 500);

    $scope.$on("$destroy", function() {
		$interval.cancel(chatLoop);
    });
}]);