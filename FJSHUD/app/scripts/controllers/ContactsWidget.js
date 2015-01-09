fjs.ui.ContactsWidget = function($scope, $location, dataManager, myHttpService) {
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    $scope.contacts = [];
	$scope.external = false;
	$scope.add = {};

    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
    var timeoutId = null;

    $scope.createContact= function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog"});
        return false;
    };
	
	// filter out self, check for external flag
	$scope.customFilter = function() {
		return function(contact) {
			if (contact.xpid != $scope.myPid)
				if (!$scope.external || ($scope.external && contact.primaryExtension == ''))
					return true;
		};
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
