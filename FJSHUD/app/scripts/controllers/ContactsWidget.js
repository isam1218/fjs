hudweb.controller('ContactsWidget', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService','$location', function($scope, $rootScope, myHttpService, contactService, groupService,$location) {
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
	$scope.goToContact = function(xpid){
		console.log("XPID",xpid);
		$location.path("/contact/"+xpid);
	};
    $scope.sort = function(field) {
        if($scope.sortField != field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
	
	/*
	// filter contacts down
	$scope.customFilter = function() {
		var tab = $scope.$parent.tab;
		
		return function(contact) {
			// remove self
			if (contact.xpid != $rootScope.myPid) {
				// filter by tab
				switch (tab) {
					case 'all':
						return true;
						break;
					case 'external':
						if (contact.primaryExtension == '')
							return true;
						break;
					case 'favorites':
						if ($scope.favorites[contact.xpid] !== undefined)
							return true;
						break;
				}
			}
		};
	};
	
	$scope.searchFilter = function(contact){
		var query = $scope.$parent.query.toLowerCase();

		if (query == '')
			return true;
		else if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || contact.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || contact.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
			return true;
	};
	*/
	
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
