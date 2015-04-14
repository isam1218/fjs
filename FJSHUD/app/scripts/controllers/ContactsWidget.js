hudweb.controller('ContactsWidget', ['$scope', '$rootScope', '$filter', '$timeout', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, $filter, $timeout, myHttpService, contactService, groupService) {
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.contacts = [];
	$scope.favorites = {};
	
	if (localStorage.recent === undefined)
		localStorage.recent = '{}';
	
	$scope.recent = JSON.parse(localStorage.recent);
	
	// pull contact updates from service
	$scope.$on('contacts_updated', function(event, data) {
		$scope.contacts = data;	
	});
	
	// pull group updates from service
	$scope.$on('groups_updated', function(event, data) {
		$scope.favorites = data.favorites;
	});

  $scope.sort = function(field) {
      if($scope.sortField!=field) {
          $scope.sortField = field;
          $scope.sortReverse = false;
      }
      else {
          $scope.sortReverse = !$scope.sortReverse;
      }
  };
	
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
	
	$scope.customSort = function() {
		// recent list doesn't have a sort field
		if ($scope.$parent.tab == 'recent')
			return 'timestamp';
		else
			return $scope.sortField;
	};
	
	$scope.customReverse = function() {
		// recent list is always reversed
		if ($scope.$parent.tab == 'recent')
			return true;
		else
			return $scope.sortReverse;
	};
	
	// record most recent contacts
	$scope.storeRecentContact = function(xpid){
		$scope.recent = JSON.parse(localStorage.recent);		
		$scope.recent[xpid] = {
			type: 'contact',
			time:  new Date().getTime()
		};
		localStorage.recent = JSON.stringify($scope.recent);
		// console.log('*storeRecentContact - ', $scope.recent);
		$rootScope.$broadcast('recentAdded', {info: xpid});
	};
	

	$scope.getCallStatusAvatar = function(call) {
		if (call && call.contactId)
			return myHttpService.get_avatar(call.contactId, 28, 28);
		else
			return 'img/Generic-Avatar-28.png';
	};
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.type == 0)
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
