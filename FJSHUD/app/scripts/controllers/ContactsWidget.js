hudweb.controller('ContactsWidget', ['$scope', '$rootScope', '$filter', '$timeout', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, $filter, $timeout, myHttpService, contactService, groupService) {
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    $scope.contacts = [];
	$scope.add = {};
	$scope.favorites = {};
	$scope.timeElapsed = 0;
	$scope.onCall = null;
	$scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

	// pull updates from service
	$scope.$on('contacts_updated', function(event, data) {
		$scope.contacts = data;
		$scope.$safeApply();
	});
	
	$scope.$on('groups_updated', function(event, data) {
		$scope.favorites = data.favorites;
		$scope.$safeApply();
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
					case 'recent':
						if ($scope.recents[contact.xpid] !== undefined) {
							// attach timestamp to sort by
							contact.timestamp = $scope.recents[contact.xpid];
							return true;
						}
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
	$scope.storeRecent = function(xpid) {
		$scope.recents[xpid] = new Date().getTime();
		localStorage.recents = JSON.stringify($scope.recents);
	};
	
	$scope.getCallStatusAvatar = function(call) {
		if (call && call.contactId)
			return myHttpService.get_avatar(call.contactId, 28, 28);
		else
			return 'img/Generic-Avatar-28.png';
	};
	
	$scope.showCallStatus = function($event, contact) {
		$scope.onCall = contact;
		$scope.$parent.showOverlay('callstatus');
		
		updateTime();
		
		$event.stopPropagation();
        $event.preventDefault();
	};
	
	var updateTime = function() {
		if ($scope.onCall.call) {
			// format date
			var date = new Date().getTime();
			$scope.timeElapsed = $filter('date')(date - $scope.onCall.call.startedAt, 'mm:ss');
		
			// increment
			if ($scope.$parent.overlay == 'callstatus')
				$timeout(updateTime, 1000);
		}
		else
			$scope.$parent.showOverlay(false);
	};
	
	/**
		ADD/EDIT CONTACTS
	*/
	
	$scope.saveContact = function() {
		// validate
		if (!$scope.add.firstName && !$scope.add.lastName) {
			$scope.addError = 'Contact name is not specified.';
			return;
		}
		else if ($scope.add.email && $scope.add.email.indexOf('@') == -1) {
			$scope.addError = 'E-mail is incorrect.';
			return;
		}
		
		// save new contact
		if (!$scope.$parent.edit)
			myHttpService.sendAction('contacts', 'addContact', $scope.add);
		else
			myHttpService.sendAction('contacts', 'updateContact', $scope.add);
			
		$scope.$parent.showOverlay(false);
		$scope.add = {};
	};
	
	// TO DO: action should take place on a contextual menu
	$scope.editContact = function(contact) {
		// only edit externals
		if (contact.primaryExtension == '') {
			$scope.$parent.showOverlay('contacts', true);
			
			$scope.add.pid = contact.xpid;
			$scope.add.displayName = contact.displayName;
			$scope.add.firstName = contact.firstName;
			$scope.add.lastName = contact.lastName;
			$scope.add.business = contact.phoneBusiness;
			$scope.add.mobile = contact.phoneMobile;
			$scope.add.email = contact.email;
			$scope.add.jid = contact.jid;
			$scope.add.ims = contact.ims;
		}
	};
	
	$scope.delContact = function() {
		myHttpService.sendAction('contacts', 'delete', {contactId: $scope.add.pid});
		$scope.$parent.showOverlay(false);
		$scope.add = {};
	};
	
	// add favorites action (via directive)
	$scope.searchContact = function(contact) {
		myHttpService.sendAction('groupcontacts', 'addContactsToFavorites', {contactIds: contact.xpid});
	};
	
	// TO DO: action should take place on a contextual menu
	$scope.removeFavorite = function($event, contact) {
		myHttpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: contact.xpid});
		
		$event.stopPropagation();
        $event.preventDefault();
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
