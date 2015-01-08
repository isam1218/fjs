fjs.core.namespace("fjs.ui");

fjs.ui.ContactsWidget = function($scope, $location, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var contactsModel = dataManager.getModel("contacts");
    document.title= "Contacts";
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
	
	// custom filter to find externals
	$scope.filterIsExternal = function() {
		return function(contact) {
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
        dataManager.sendAction('contacts', 'addContact', $scope.add);
		$scope.$parent.showOverlay(false);
		$scope.add = {};
	};
	
	$scope.$on('contacts_synced', function(event, data) {
		$scope.contacts = data;
	});

    $scope.getAvatarUrl = function(xpid) {
        return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + xpid + "&w=28&h=28&Authorization=" + dataManager.api.ticket + "&node=" + dataManager.api.node;
    };

    $scope.$on("$destroy", function() {

    });
};
fjs.core.inherits(fjs.ui.ContactsWidget, fjs.ui.Controller)
