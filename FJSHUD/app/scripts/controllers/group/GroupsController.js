hudweb.controller('GroupsController', ['$scope', '$rootScope', 'HttpService', 'GroupService', 'ContactService', function($scope, $rootScope, myHttpService, groupService, contactService) {
  $scope.query = "";
  $scope.sortField = "name";
  $scope.sortReverse = false;
  $scope.groups = [];
	$scope.mine = null;
	$scope.favoriteID = null;
  $scope.contacts = [];
  $scope.groupObj = {};
  $scope.combined = [];
  $scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

  // update contacts
  $scope.$on('contacts_updated', function(event, data){
    $scope.contacts = data;
    $scope.combined = $scope.contacts.concat($scope.groupObj.groups);
  });

  // pull group updates from service, including groups from local storage
  $scope.$on('groups_updated', function(event, data) {
    $scope.recents = JSON.parse(localStorage.recents);
    $scope.groups = data.groups;
    $scope.mine = data.mine;
    $scope.favoriteID = data.favoriteID;

    $scope.groupObj = data;
    $scope.combined = $scope.contacts.concat($scope.groupObj.groups);
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
	
	$scope.getOwner = function(group) {
		if (group.ownerId == $rootScope.myPid)
			return 'owner: me';
		else {
			var contact = contactService.getContact(group.ownerId);
			return (contact ? 'owner: ' + contact.displayName : '');
		}
	};

  // store most recent groups into local Storage
  $scope.storeRecent = function(groupXpid){
    $scope.recents[groupXpid] = new Date().getTime();
    localStorage.recents = JSON.stringify($scope.recents);
  };

}]);