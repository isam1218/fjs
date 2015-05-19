hudweb.controller('GroupEditOverlayController', ['$scope', '$rootScope', 'ContactService', 'HttpService', 'GroupService', function($scope, $rootScope, contactService, httpService, groupService) {
	$scope.add = {type: 2, contacts: []};
	$scope.editing = false;

	contactService.getContacts().then(function(data) {
		// add user as first group member
		$scope.add.contacts[0] = contactService.getContact($rootScope.myPid);
	
		var curGroup = groupService.getGroup($rootScope.groupInfoId);

		// if no current group cuz haven't visited the group info page
		if (!curGroup){
			// no current group but creating a new group w/ user
			$scope.add.contacts[1] = contactService.getContact($scope.$parent.overlay.data);
		} else {
			for (var i = 0; i < curGroup.members.length; i++){
				// if user is a member of the group clicked on...
				if ($rootScope.myPid === curGroup.members[i].fullProfile.xpid){
					$scope.editing = true;
					console.log('match!', $scope.editing);
					var group = curGroup;
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
			}
		}	
	});
	
	$scope.searchContact = function(contact) {
		// prevent duplicates
		for (i = 0; i < $scope.add.contacts.length; i++) {
			if ($scope.add.contacts[i] == contact)
				return;
		}
		
		$scope.$evalAsync(function() {
			$scope.add.contacts.push(contact);
		});
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
		$scope.add.message = finalDeletedGroupMessage;

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
