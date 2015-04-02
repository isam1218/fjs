hudweb.controller('ConversationWidgetController', ['$scope', '$routeParams', 'ContactService','PhoneService','$filter','$timeout', function($scope, $routeParams, contactService,phoneService,$filter,$timeout) {
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
	
	$scope.tabs = ['Chat', 'Voicemails', 'Groups','Queues', 'Call Log'];
	$scope.selected = 'Chat';



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
