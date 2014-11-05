fjs.core.namespace("fjs.ui");

fjs.ui.ContactsWidget = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var contactsModel = dataManager.getModel("contacts");
    document.title= "Contacts";
    $scope.query = "";
    $scope.sortField = "timestamp";
    $scope.sortReverce = true;
    $scope.contacts = contactsModel.items;
	
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

    $scope.$on("$destroy", function() {

    });
};
fjs.core.inherits(fjs.ui.ContactsWidget, fjs.ui.Controller)
