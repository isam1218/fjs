fjs.ui.ConversationWidgetChatController = function($scope, myHttpService) {
    $scope.messages = [];
	
	// get initial messages from server
	myHttpService.getChat($scope.contactID).then(function(data) {
		$scope.messages = data;
		
		// find name and avatar
		for (m in $scope.messages) {
			var xpid = $scope.messages[m].from.replace('contacts:', '');
			$scope.messages[m].avatar = myHttpService.get_avatar(xpid, 28, 28);
		}
	});
	
	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		$scope.messages = $scope.messages.concat(data);
		
		// find name and avatar
		for (m in $scope.messages) {
			var xpid = $scope.messages[m].from.replace('contacts:', '');
			$scope.messages[m].avatar = myHttpService.get_avatar(xpid, 28, 28);
		}
		
		$scope.$safeApply();
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

    $scope.$on("$destroy", function() {
	
    });

};