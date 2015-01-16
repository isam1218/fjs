fjs.ui.GroupsController = function($scope, $rootScope, myHttpService, groupService) {
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverse = false;
    $scope.groups = [];
	$scope.mine = null;
	$scope.add = {type:2};

	// pull updates from service
	groupService.then(function(data) {
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
		
		if(group.members){
			if (group.members[index] !== undefined) {
				var xpid = group.members[index];
				return myHttpService.get_avatar(xpid,40,40);
			}
			else
				return 'img/Generic-Avatar-14.png';

		}
    };
};