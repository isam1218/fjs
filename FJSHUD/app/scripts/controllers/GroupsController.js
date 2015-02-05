hudweb.controller('GroupsController', ['$scope', '$rootScope', 'HttpService', 'GroupService', 'ContactService', function($scope, $rootScope, myHttpService, groupService, contactService) {
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverse = false;
    $scope.groups = [];
	$scope.mine = null;
	$scope.favoriteID = null;
	$scope.add = {type: 2, contacts: []};
	
	// add user as first group member
	contactService.getContacts().then(function(data) {
		$scope.add.contacts[0] = contactService.getContact($rootScope.myPid);
	});

	// pull updates from service
	$scope.$on('groups_updated', function(event, data) {
		$scope.groups = data.groups;
		$scope.mine = data.mine;
		$scope.favoriteID = data.favoriteID;
		
		$scope.$safeApply();
	});
	
    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };
	
	// filter groups down
	$scope.customFilter = function(type) {
		return function(group) {
			// remove mine
			if (group != $scope.mine && $scope.favoriteID != group.xpid) {
				switch (type) {
					case 'all':
						return (group.type == 0);
						break;
					case 'mine':
						return (group.ownerId == $rootScope.myPid);
						break;
					case 'shared':
						// find groups i don't own but that i belong to
						if (group.ownerId != $rootScope.myPid && group.members) {
							for (i = 0; i < group.members.length; i++) {
								if (group.members[i].contactId == $rootScope.myPid)
									return true;
							}
						}
						break;
					case 'others':
						return (group.type == 4);
						break;
				}
			}
		};
	};
	
	// display avatar for group member
    $scope.getAvatarUrl = function(group, index) {
		if (group.members) {
			if (group.members[index] !== undefined) {
				var xpid = group.members[index].contactId;
				return myHttpService.get_avatar(xpid, 28, 28);
			}
			else
				return 'img/Generic-Avatar-28.png';

		}
    };
	
	$scope.getOwner = function(group) {
		if (group.ownerId == $rootScope.myPid)
			return 'owner: me';
		else {
			var contact = contactService.getContact(group.ownerId);
			return (contact ? 'owner: ' + contact.displayName : '');
		}
	};
	
	/**
		ADD/EDIT GROUPS
	*/
	
	// comes from conversation widget
	$scope.$on('new_group', function(event, data) {
		$scope.$parent.tab = 'groups';
		$scope.$parent.showOverlay('groups');
		
		$scope.add.contacts[1] = contactService.getContact(data);
	});
	
	// comes from contextual directive (editing)
	$scope.$on('editGroup', function(event, data) {
		$scope.$parent.showOverlay('groups');
		$scope.editing = true;
		
		$scope.add.groupId = data.xpid;
		$scope.add.name = data.name;
		$scope.add.description = data.description;
		$scope.add.type = data.type;
		
		angular.forEach(data.members, function(obj) {
			// avoid adding self again
			if (obj.contactId != $rootScope.myPid)
				$scope.add.contacts.push(contactService.getContact(obj.contactId));
		});
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
		myHttpService.sendAction('groups', $scope.closing ? 'removeWorkgroup' : ($scope.editing ? 'updateWorkgroup' : 'addWorkgroup'), $scope.add);
		
		$scope.clearGroup();
	};
	
	$scope.endGroup = function() {
		$scope.closing = true;
	};
	
	$scope.clearGroup = function() {
		$scope.add = {type: 2, contacts: []};
		$scope.add.contacts[0] = contactService.getContact($rootScope.myPid);
		
		$scope.addError = null;
		$scope.editing = false;
		$scope.closing = false;
		$scope.$parent.showOverlay(false);
	};
}]);