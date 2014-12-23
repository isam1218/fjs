fjs.core.namespace("fjs.ui");

fjs.ui.ContactsWidget = function($scope, $location, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var contactsModel = dataManager.getModel("contacts");
    document.title= "Contacts";
    $scope.query = "";
    $scope.sortField = "timestamp";
    $scope.sortReverce = true;
    $scope.contacts = contactsModel.items;
	
	// turn "externals" on
	if ($location.path().indexOf('external') != -1)
		$scope.external = true;
	
	// update contacts asap
	contactsModel.addEventListener("complete", function() {
		$scope.$safeApply();
	});

    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverce = false;
        }
        else {
            $scope.sortReverce = !$scope.sortReverce;
        }
    };
    var timeoutId = null;

    $scope.createContact= function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog"});
        return false;
    };

    $scope.filterContactFn = function(searchInput) {
        return function(contact){
            if(searchInput) {
                return contact.pass(searchInput);
            }
            return true;
        };
    };
	
	// custom filter to find externals
	$scope.filterIsExternal = function() {
		return function(contact) {
			if ((!$scope.external && !contact.isExternal()) || ($scope.external && contact.isExternal()))
				return true;
		};
	};
	
	// attach recent activity to contacts
	$scope.$on("updateRecent", function(event, recents) {
		for (c in $scope.contacts) {
			for (r in recents) {
				if (r.replace('contact_', '') == $scope.contacts[c].xpid) {
					$scope.contacts[c].timestamp = recents[r].timestamp;
					$scope.contacts[c].events = recents[r].events ? recents[r].events.length : 0;
					break;
				}
			}
		}
		
		$scope.$safeApply();
	});
	
	// add new contact pop-up
	$scope.showOverlay = function() {
		$scope.add = {};
		$scope.addError = null;
		$scope.overlay = true;
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
        dataManager.sendAction('contacts', 'addContact', $scope.add);
		$scope.overlay = false;
	};

    $scope.$on("$destroy", function() {

    });
};
fjs.core.inherits(fjs.ui.ContactsWidget, fjs.ui.Controller)
