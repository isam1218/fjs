hudweb.controller('GroupsController', ['$scope', '$rootScope', 'HttpService', 'GroupService', function($scope, $rootScope, myHttpService, groupService) {
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverse = false;
    $scope.groups = [];
	$scope.mine = null;
	$scope.add = {type:2};

	// pull updates from service
	$scope.$on('groups_updated', function(event, data) {
		$scope.groups = data.groups;
		$scope.mine = data.mine;
		
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
	
	$scope.addGroup = function() {
		// TO DO: validation
		
		$scope.add.contactIds = $rootScope.myPid;
		
		// save
		myHttpService.sendAction('groups', 'addWorkgroup', $scope.add);
		$scope.$parent.showOverlay(false);
		$scope.add = {type:2};
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
}]);