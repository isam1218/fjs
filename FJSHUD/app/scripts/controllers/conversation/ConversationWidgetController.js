hudweb.controller('ConversationWidgetController', ['$scope', '$routeParams', '$location', 'ContactService', function($scope, $routeParams, $location, contactService) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);
	$scope.messages = [];

    $scope.enableChat = true;
    $scope.enableFileShare = true;
	
    $scope.targetId = $scope.contactID;
    $scope.targetAudience="contact";
    $scope.targetType="f.conversation.wall";
    $scope.feed = "contacts"


	$scope.$on('contacts_updated', function(event, data) {
		// find this contact
		for (i in data) {
			if (data[i].xpid == $scope.contactID) {
				$scope.contact = data[i];
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
