fjs.ui.ConversationWidgetChatController = function($scope, $interval, contactService, myHttpService) {
	var version = 0;
	
	$scope.loading = true;
    $scope.messages = [];
	
	// get initial messages from server
	myHttpService.getChat('contacts', $scope.contactID).then(function(data) {
		version = data.h_ver;
		
		$scope.loading = false;
		$scope.messages = data.items;		
		$scope.addDetails();
	});
	
	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		$scope.messages = $scope.messages.concat(data);
		$scope.addDetails();
	});
	
	// apply name and avatar
	$scope.addDetails = function() {
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
				$scope.addDetails();

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
};