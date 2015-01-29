hudweb.controller('ConversationWidgetController', ['$scope', '$routeParams', 'ContactService', function($scope, $routeParams, contactService) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);	
	
	$scope.$on('contacts_updated', function(event, data) {
		// find this contact
		for (i in data) {
			if (data[i].xpid == $scope.contactID) {
				$scope.contact = data[i];
				break;
			}
		}
		
		$scope.$safeApply();
	});
	
	$scope.tabs = ['Chat', 'Voicemails', 'Groups','Queues', 'Call Log'];
	$scope.selected = 'Chat';

    $scope.fileShare = function() {
      alert('not implemented');
    };

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
