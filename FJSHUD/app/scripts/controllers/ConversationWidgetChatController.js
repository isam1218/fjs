fjs.ui.ConversationWidgetChatController = function($scope, contactService, myHttpService) {
    $scope.messages = [];
	
	// get initial messages from server
	myHttpService.getChat($scope.contactID).then(function(data) {
		$scope.messages = data;
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

    $scope.$on("$destroy", function() {
	
    });

};