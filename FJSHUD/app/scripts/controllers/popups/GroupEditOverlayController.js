hudweb.controller('GroupEditOverlayController', ['$scope', '$rootScope', '$routeParams', '$location', 'ContactService', 'HttpService', 'GroupService', function($scope, $rootScope, $routeParams, $location, contactService, httpService, groupService) {
	$scope.add = {type: 2, contacts: []};
	$scope.editing = false;

	// add user as first group member
	$scope.add.contacts[0] = contactService.getContact($rootScope.myPid);
	
	// grab data from showOverlay()
	if ($scope.$parent.overlay.data) {
		var data = $scope.$parent.overlay.data;
		
		// individual contact
		if (data.firstName)
			$scope.add.contacts[1] = data;
		// group edit
		else {
			$scope.editing = true;
			$scope.add.groupId = data.xpid;
			$scope.add.name = data.name;
			$scope.add.description = data.description;
			$scope.add.type = data.type;
			
			for (var i = 0; i < data.members.length; i++) {
				// avoid adding self again
				if (data.members[i].contactId != $rootScope.myPid)
					$scope.add.contacts.push(contactService.getContact(data.members[i].contactId));
			}
		}
	}
	
	$scope.searchContact = function(contact) {
		// prevent duplicates
		for (var i = 0; i < $scope.add.contacts.length; i++) {
			if ($scope.add.contacts[i] == contact)
				return;
		}
		
		$scope.$evalAsync(function() {
			$scope.add.contacts.push(contact);
		});
	};
	
	$scope.removeUser = function(contact) {
		for (var i = 0; i < $scope.add.contacts.length; i++) {
			if ($scope.add.contacts[i] == contact) {
				$scope.add.contacts.splice(i, 1);
				break;
			}
		}
	};
	
	$scope.saveGroup = function() {
		// validate
		if (!$scope.add.name) {
			$scope.addError = 'Group name is not specified.';
			return;
		}
		
		// comma separated list
		$scope.add.contactIds = '';
		for (var i = 0; i < $scope.add.contacts.length; i++){
			if ($scope.add.contacts[i] != null){
				$scope.add.contactIds += $scope.add.contacts[i].xpid + ',';
			}
		}

		delete $scope.add.contacts;
		
		var deletedGroupMessage = $scope.add.message;
		var groupName = $scope.add.name;
		var deletedMessageIntro = "GOODBYE " + groupName + "!  "; 
		var finalDeletedGroupMessage = deletedMessageIntro + deletedGroupMessage;

		// save
		httpService.sendAction('groups', $scope.closing ? 'removeWorkgroup' : ($scope.editing ? 'updateWorkgroup' : 'addWorkgroup'), $scope.add);
		
		// change location
		if ($scope.closing && $routeParams.groupId && $routeParams.groupId == $scope.add.groupId)
			$location.path('/settings/');
		
		$scope.showOverlay(false);
	};
	
	$scope.endGroup = function() {
		$scope.closing = true;
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
