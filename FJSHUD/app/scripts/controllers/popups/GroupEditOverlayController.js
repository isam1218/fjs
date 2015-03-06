hudweb.controller('GroupEditOverlayController', ['$scope', '$rootScope', 'ContactService', 'HttpService', function($scope, $rootScope, contactService, httpService) {
	$scope.add = {type: 2, contacts: []};
	
	contactService.getContacts().then(function(data) {
		// add user as first group member
		$scope.add.contacts[0] = contactService.getContact($rootScope.myPid);
	
		// existing data
		if ($scope.$parent.overlay.data) {
			if ($scope.$parent.overlay.data.name) {
				var group = $scope.$parent.overlay.data;
				$scope.editing = true;
				
				$scope.add.groupId = group.xpid;
				$scope.add.name = group.name;
				$scope.add.description = group.description;
				$scope.add.type = group.type;
				
				angular.forEach(group.members, function(obj) {
					// avoid adding self again
					if (obj.contactId != $rootScope.myPid)
						$scope.add.contacts.push(contactService.getContact(obj.contactId));
				});
			}
			// new group with specific user
			else
				$scope.add.contacts[1] = contactService.getContact($scope.$parent.overlay.data);
		}
	});
	
	$scope.searchContact = function(contact) {
		// prevent duplicates
		for (i = 0; i < $scope.add.contacts.length; i++) {
			if ($scope.add.contacts[i] == contact)
				return;
		}
		
		$scope.add.contacts.push(contact);
	};
	
	$scope.removeUser = function(contact) {
		for (i = 0; i < $scope.add.contacts.length; i++) {
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
		for (i = 0; i < $scope.add.contacts.length; i++)
			$scope.add.contactIds += $scope.add.contacts[i].xpid + ',';
		delete $scope.add.contacts;
		
		// save
		httpService.sendAction('groups', $scope.closing ? 'removeWorkgroup' : ($scope.editing ? 'updateWorkgroup' : 'addWorkgroup'), $scope.add);
		
		$scope.showOverlay(false);
	};
	
	$scope.endGroup = function() {
		$scope.closing = true;
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
