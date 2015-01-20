fjs.ui.ConversationWidgetController = function($scope, $routeParams, $timeout, $filter, contactService) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = '';
	
	contactService.then(function(data) {
		// find this contact
		for (i in data) {
			if (data[i].xpid == $scope.contactID)
				$scope.contact = data[i];
		}
	});
	
	$scope.tabs = ['Chat', 'Voicemails', 'Groups', 'Call Log'];
	$scope.selected = 'Chat';

    $scope.fileShare = function() {
      alert('not implemented');
    };
	
    var onDurationTimeout = function() {
        if($scope.contact && $scope.contact.hasCall()) {
            var date = Date.now();
            var time = date + (new Date(1).getTimezoneOffset() * 1000 * 60);
            var timeDur = time - $scope.contact.calls_startedAt;
            $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, 1000);
    };

    onDurationTimeout();

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }


    $scope.$on("$destroy", function() {
	
    });

    $scope.sendMessage = function() {
        var input = document.getElementById('ChatInputBox_'+$scope.contact.xpid);
        var msg = input.textContent;
        dataManager.sendAction('streamevent', 'sendConversationEvent', {
            type:'f.conversation.chat',
            audience:'contact',
            to:$scope.contact.xpid,
            message:msg
        });
        dataManager.sendAction("widget_history", "push", {xpid:'contact_'+$scope.contact.xpid, messge:msg, key:'contact/'+$scope.contact.xpid, timestamp:Date.now()});
        input.innerHTML = "";
    };

    $scope.chatInputOnKeyPress = function($event) {
        if($event.keyCode == 13) {
            $scope.sendMessage();
        }
    };
};
