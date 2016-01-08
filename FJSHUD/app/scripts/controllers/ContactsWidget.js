hudweb.controller('ContactsWidget', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, myHttpService, contactService, groupService) {
	$scope.query = "";
	$scope.sortField = "displayName";
	$scope.sortReverse = false;
	$scope.contacts = [];
	$scope.favorites = {};
	
	// pull contact updates from service
	contactService.getContacts().then(function(data) {
		var length = data.length;
		for(var l=0; l < length; l++)
		{	
			var contact = data[l];
			var cur_id = contact && contact.id ? contact.id : '';
			if(cur_id != '' && cur_id == $rootScope.meModel.my_pid)
			{
				$rootScope.meModel.username = data[l].username;
				data.splice(l, 1);
			}	
		}	
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
