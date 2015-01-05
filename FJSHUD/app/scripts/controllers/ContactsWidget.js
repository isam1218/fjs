fjs.core.namespace("fjs.ui");

fjs.ui.ContactsWidget = function($scope, $location, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var contactsModel = dataManager.getModel("contacts");
    document.title= "Contacts";
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverce = false;
    $scope.contacts = contactsModel.items;
	$scope.external = false;
	$scope.add = {};
	
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

    $scope.filterContactFn = function() {
        return function(contact){
            if($scope.$parent.query) {
                return contact.pass($scope.$parent.query);
            }
            return true;
        };
    };
	
	// custom filter to find externals
	$scope.filterIsExternal = function(external) {
		return function(contact) {
			if ((!external && !contact.isExternal()) || (external && contact.isExternal()))
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

    $scope.$on("$destroy", function() {

    });
};
fjs.core.inherits(fjs.ui.ContactsWidget, fjs.ui.Controller)
