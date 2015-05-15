hudweb.controller('GroupsController', ['$scope', '$rootScope', 'HttpService', 'GroupService', 'ContactService', function($scope, $rootScope, myHttpService, groupService, contactService) {
  $scope.query = "";
  $scope.sortField = "name";
  $scope.sortReverse = false;
  $scope.groups = [];
	$scope.mine = null;
	$scope.favoriteID = null;
  var addedPid;

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}';
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  // pull group updates from service, including groups from local storage
  $scope.$on('groups_updated', function(event, data) {
    $scope.groups = data.groups;
    $scope.mine = data.mine;
    $scope.favoriteID = data.favoriteID;

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
						return (group.type == 4 && group.ownerId != $rootScope.myPid);
						break;
				}
			}
		};
	};

  $scope.searchFilter = function(){
    var query = $scope.$parent.query;
    return function(group){
      // console.log('group - ', group);
      if (group.name.toLowerCase().indexOf(query) != -1 || group.extension.indexOf(query) != -1)
        return true;
      if (group.members.length > 0){
        for (var i = 0; i < group.members.length; i++){
          var singleMember = group.members[i].fullProfile;
          if (singleMember.fullName.toLowerCase().indexOf(query) != -1 || singleMember.primaryExtension.indexOf(query) != -1 || singleMember.phoneMobile.indexOf(query) != -1)
            return true;
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
  $scope.storeRecentGroup = function(groupXpid){
    var localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
    $scope.recent[groupXpid] = {
      type: 'group',
      time: new Date().getTime()
    };
    localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
    $rootScope.$broadcast('recentAdded', {id: groupXpid, type: 'group', time: new Date().getTime()});
  };

}]);