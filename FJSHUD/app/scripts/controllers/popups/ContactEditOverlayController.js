hudweb.controller('ContactEditOverlayController', ['$scope', 'HttpService', function($scope, httpService) {
	$scope.add = {};
	
	if ($scope.$parent.overlay.data) {
		var contact = $scope.$parent.overlay.data;
		$scope.editing = true;
		
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
		httpService.sendAction('contacts', $scope.editing ? 'updateContact' : 'addContact', $scope.add);
			
		$scope.showOverlay(false);
	};
	
	$scope.delContact = function() {
		httpService.sendAction('contacts', 'delete', {contactId: $scope.add.pid});
		
		$scope.showOverlay(false);
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
