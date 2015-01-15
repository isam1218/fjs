fjs.ui.ContactsWidget = function($scope, $rootScope, myHttpService) {
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    $scope.contacts = [];
	$scope.add = {};
	$scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

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

    $scope.getAvatarUrl = function(xpid) {
    	return myHttpService.get_avatar(xpid,28,28);
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
			$scope.$parent.showOverlay(true, true);
			
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
	
	/**
		SYNCING
	*/
	
	$scope.$on('contacts_synced', function(event, data) {
		// initial sync
		if ($scope.contacts.length < 1) {
			$scope.contacts = data;
			$rootScope.loaded = true;
		}
		else {
			for (i = 0; i < data.length; i++) {	
				for (c = 0; c < $scope.contacts.length; c++) {
					// found contact
					if ($scope.contacts[c].xpid == data[i].xpid) {
						// update or delete
						if (data[i].xef001type == 'delete')
							$scope.contacts.splice(c, 1);
						else
							$scope.contacts[c] = data[i];
							
						break;
					}
					
					// no match, so new record
					if (c == $scope.contacts.length-1)
						$scope.contacts.push(data[i]);
				}
			}
		}
		
		$scope.$apply();
	});
	
	$scope.$on('contactstatus_synced', function(event, data) {
		for (key in data) {
			for (c in $scope.contacts) {
				// set contact's status
				if ($scope.contacts[c].xpid == data[key].xpid) {
					$scope.contacts[c].hud_status = data[key].xmpp;
					break;
				}
			}
		}
	});
	
	$scope.$on('calls_synced', function(event, data) {
		for (key in data) {
			for (c in $scope.contacts) {
				// set contact's status
				if ($scope.contacts[c].xpid == data[key].xpid) {
					$scope.contacts[c].calls_startedAt = data[key].startedAt;
					break;
				}
			}
		}
	});

    $scope.$on("$destroy", function() {

    });
};
