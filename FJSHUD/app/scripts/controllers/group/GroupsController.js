hudweb.controller('GroupsController', ['$q', '$scope', '$rootScope', '$routeParams', 'HttpService', 'GroupService', 'SettingsService', 'ContactService', function($q, $scope, $rootScope, $routeParams, myHttpService, groupService, settingsService, contactService) {
  $scope.query = "";
  $scope.sortField = "name";
  $scope.sortReverse = false;
  $scope.groups = $rootScope.groups;//[];
  $scope.mine = null;
  $scope.favoriteID = null;
  $scope.my_id = $rootScope.meModel.my_pid;//.split('_')[1];
  var my_id = $rootScope.meModel.my_pid;
  var contactId = $routeParams.contactId;	
  var server_id = $rootScope.meModel.server_id;

  
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
	/*$scope.customFilter = function(type) {
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
							for (var i = 0, iLen = group.members.length; i < iLen; i++) {
								if (group.members[i].contactId == $rootScope.myPid)
									return true;
							}
						}
						break;
					case 'others':
						if (group.type == 4 && group.ownerId != $rootScope.myPid) {
							for (var i = 0, iLen = group.members.length; i < iLen; i++) {
								if (group.members[i].contactId == $rootScope.myPid)
									return false;
							}
							
							return true;
						}
						break;
				}
			}
		};
	};*/

  $scope.searchFilter = function(){
    var query = $scope.$parent.query.toLowerCase();
	
    return function(group){
      if ((group.name || group.extension || group.description) && (group.name.toLowerCase().indexOf(query) != -1 || group.extension.indexOf(query) != -1 || group.description.toLowerCase().indexOf(query) != -1))
        return true;
      else if (group.members.length > 0){
        for (var i = 0, iLen = group.members.length; i < iLen; i++){
          var singleMember = group.members[i].fullProfile;
		  
          if (singleMember.fullName.toLowerCase().indexOf(query) != -1 || singleMember.primaryExtension.indexOf(query) != -1 || singleMember.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || singleMember.phoneMobile.indexOf(query) != -1 || singleMember.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
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

}]);