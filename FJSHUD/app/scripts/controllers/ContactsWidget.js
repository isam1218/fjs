hudweb.controller('ContactsWidget', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, myHttpService, contactService, groupService) {
	$scope.query = "";
	$scope.sortField = "displayName";
	$scope.sortReverse = false;
	$scope.contacts = [];
	$scope.favorites = {};
	
	// pull contact updates from service
	contactService.getContacts().then(function(data) {
		$scope.contacts = data;	
	});
	
	// pull group updates from service
	groupService.getGroups().then(function(data) {
		$scope.favorites = data.favorites;
	});
	
    $scope.sort = function(field) {
        if($scope.sortField != field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.contactId == $rootScope.myPid)
			return;
	
		$scope.showOverlay(true, 'CallStatusOverlay', contact);
	};
	
	// add favorites action (via directive)
	$scope.searchContact = function(contact) {
		myHttpService.sendAction('groupcontacts', 'addContactsToFavorites', {contactIds: contact.xpid});
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
