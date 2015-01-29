hudweb.controller('GroupSingleController', ['$scope', '$routeParams', 'HttpService', 'GroupService', function($scope, $routeParams, myHttpService, groupService) {
	$scope.groupID = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupID);
	$scope.isMine = groupService.isMine($scope.groupID);
	
	$scope.$on('groups_updated', function(event, data) {
		var groups = data.groups;
		
		// find this group
		for (i in groups) {
			if (groups[i].xpid == $scope.groupID) {
				$scope.group = groups[i];
				break;
			}
		}
				
		$scope.isMine = groupService.isMine($scope.groupID);		
		$scope.$safeApply();
	});
	
	$scope.tabs = ['Chat', 'Members', 'Voicemails', 'Page'];
	$scope.selected = 'Members';
	
	// display avatar for group member
    $scope.getAvatarUrl = function(index) {
		if ($scope.group && $scope.group.members) {
			if ($scope.group.members[index] !== undefined) {
				var xpid = $scope.group.members[index].contactId;
				return myHttpService.get_avatar(xpid, 28, 28);
			}
			else
				return 'img/Generic-Avatar-28.png';

		}
    };
	
    $scope.$on("$destroy", function() {
	
    });
}]);