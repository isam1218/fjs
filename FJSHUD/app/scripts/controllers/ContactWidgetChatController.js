fjs.core.namespace("fjs.ui");

fjs.ui.ContactWidgetChatController = function($rootScope, $scope, $routeParams, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this,  $scope, $routeParams.contactId, dataManager);
    var contactModel = dataManager.getModel("contacts"), durationTimer;
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactModel.items[$routeParams.contactId];
	
	// override data, where "stack" comes from ng-repeat
    if (typeof $scope.stack !== "undefined") {
		$scope.contactId = $scope.stack;
		$scope.contact = contactModel.items[$scope.stack];
	}

    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    };

    $scope.fileShare = function() {
      alert('not implemented');
    };
    var quickInboxModel = dataManager.getModel('quickinbox');
    var qikeys = Object.keys(quickInboxModel.items);
    for(var i=0; i<qikeys.length; i++) {
        var qitem = quickInboxModel.items[qikeys[i]];
        if (qitem.senderId == $scope.contactId) {
            dataManager.sendAction('quickinbox', 'remove', {pid: qitem.xpid});
        }
    }
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

    contactModel.addEventListener("push", update);

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }


    $scope.$on("$destroy", function() {
        contactModel.removeEventListener("push", update);
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
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
	
	// remove chat panel
	$scope.removeChat = function(xpid) {
		for (var i = $rootScope.stackables.length-1; i >= 0; i--) {
			if ($rootScope.stackables[i] == xpid) {
				$rootScope.stackables.splice(i, 1);
				break;
			}
		}
	};
};

fjs.core.inherits(fjs.ui.ContactWidgetChatController, fjs.ui.ConversationWidgetController);

