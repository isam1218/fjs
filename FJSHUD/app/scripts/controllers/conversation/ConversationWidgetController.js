hudweb.controller('ConversationWidgetController', ['$scope', '$routeParams', 'ContactService','PhoneService','$filter','$timeout','$location', function($scope, $routeParams, contactService,phoneService,$filter,$timeout,$location) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);
	$scope.messages = [];
	
	var CONFERENCE_CALL_TYPE = 0;
	var CONTACT_CALL_TYPE = 4

    $scope.enableChat = true;
    $scope.enableFileShare = true;
    $scope.call = {};
    $scope.targetId = $scope.contactID;
    $scope.targetAudience="contact";
    $scope.targetType="f.conversation.wall";
    $scope.feed = "contacts"

    if($scope.contact && $scope.contact.call){
    	$scope.targetCallContact = contactService.getContact($scope.contact.call.contactId);
	}

    
	$scope.$on('contacts_updated', function(event, data) {
		// find this contact
		for (i in data) {
			if (data[i].xpid == $scope.contactID) {
				$scope.contact = data[i];
				if($scope.contact && $scope.contact.call){
					updateTime();
				}
				break;
			}
		}
	});
	
	// $scope.tabs = ['Chat', 'Voicemails', 'Groups','Queues', 'Call Log'];
    $scope.tabs = [{upper: 'Chat', lower: 'chat'}, {upper: 'Voicemails', lower: 'voicemails'}, {upper: 'Groups', lower: 'groups'}, {upper: 'Queues', lower: 'queues'}, {upper: 'Call Log', lower: 'calllog'}];
	$scope.selected = 'Chat';

    // console.log('location path - ', $location.path());

    if ($location.path().indexOf('/chat') !== -1){
        $scope.selected = 'Chat';
    } else if ($location.path().indexOf('/members') !== -1){
        $scope.selected = 'Members';
    } else if ($location.path().indexOf('/voicemails') !== -1){
        $scope.selected = 'Voicemails';
    } else if ($location.path().indexOf('/groups') !== -1){
        $scope.selected = 'Groups';
    } else if ($location.path().indexOf('/queues') !== -1){
        $scope.selected = 'Queues';
    } else if ($location.path().indexOf('calllog') !== -1){
        $scope.selected = 'Call Log';
    }


	var updateTime = function() {
        if ($scope.contact.call && $scope.contact.call.startedAt) {
            // format date
            var date = new Date().getTime();
            $scope.call.duration = $filter('date')(date - $scope.contact.call.startedAt, 'mm:ss');
            
            // increment
            $timeout(updateTime, 1000);

        }
    };

    if($scope.contact && $scope.contact.call){
    	updateTime();
    }

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }

    $scope.$on("$destroy", function() {
	
    });
}]);
