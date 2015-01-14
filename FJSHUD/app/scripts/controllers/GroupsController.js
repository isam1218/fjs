fjs.ui.GroupsController = function($scope, $rootScope, dataManager, myHttpService) {
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverse = false;
    $scope.groups = [];
	$scope.mine = null;
	$scope.add = {type:2};
	
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
	
	$scope.$on('groups_synced', function(event, data) {
		$scope.groups = data;
	});
	
	$scope.$on('groupcontacts_synced', function(event, data) {
		// need to add members to each group
		for (g in $scope.groups) {
			$scope.groups[g].members = [];
			
			for (key in data) {
				if (data[key].groupId == $scope.groups[g].xpid) {
					$scope.groups[g].members.push(data[key].contactId);
					
					// mark as mine
					if (!$scope.mine && data[key].contactId == $rootScope.myPid)
						$scope.mine = $scope.groups[g];
				}
			}
		}
	});
};