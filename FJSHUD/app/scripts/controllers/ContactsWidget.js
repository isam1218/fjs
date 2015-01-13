fjs.ui.ContactsWidget = function($scope, $rootScope, dataManager, myHttpService) {
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
						if ($scope.recents[contact.xpid] !== undefined)
							return true;
						break;
					case 'favorites':
						break;
				}
			}
		};
	};
	
	// record most recent contacts
	$scope.storeRecent = function(xpid) {
		$scope.recents[xpid] = 1;
		localStorage.recents = JSON.stringify($scope.recents);
	};
	
	$scope.addContact = function() {
		// validate
		if (!$scope.add.firstName && !$scope.add.lastName) {
			$scope.addError = 'Contact name is not specified.';
			return;
		}
		else if ($scope.add.email && $scope.add.email.indexOf('@') == -1) {
			$scope.addError = 'E-mail is incorrect.';
			return;
		}
		
		// save
        myHttpService.sendAction('contacts', 'addContact', $scope.add);
		$scope.$parent.showOverlay(false);
		$scope.add = {};
	};
	
	$scope.$on('contacts_synced', function(event, data) {
		$scope.contacts = data;
		$rootScope.loaded = true;
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

    $scope.getAvatarUrl = function(xpid) {
        return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + xpid + "&w=28&h=28&Authorization=" + dataManager.api.ticket + "&node=" + dataManager.api.node;
    };

    $scope.$on("$destroy", function() {

    });
};
