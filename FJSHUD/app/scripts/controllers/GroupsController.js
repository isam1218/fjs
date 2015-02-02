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
	
	/**
		ADD/EDIT GROUPS
	*/
	
	// comes from conversation widget
	$scope.$on('new_group', function(event, data) {
		$scope.$parent.tab = 'groups';
		$scope.$parent.showOverlay('groups');
		
		$scope.add.contacts[1] = contactService.getContact(data);
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
	
	$scope.addGroup = function() {
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
		myHttpService.sendAction('groups', 'addWorkgroup', $scope.add);
		$scope.$parent.showOverlay(false);
		$scope.add = {type: 2, contacts: []};
	};
}]);