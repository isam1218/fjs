hudweb.controller('GroupSingleController', ['$scope', '$routeParams', '$location', 'HttpService', 'GroupService', function($scope, $routeParams, $location, myHttpService, groupService) {
	$scope.groupID = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupID);
	$scope.isMine = groupService.isMine($scope.groupID);
	$scope.selected = 'Chat';
	
	$scope.targetId = $scope.groupID;
	$scope.conversationType = 'group';
	$scope.targetAudience = "group";
	$scope.targetType = "f.conversation.chat";
	$scope.feed = "groups";

    $scope.enableChat = true;
    $scope.enableFileShare = true;
	$scope.messages = [];


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
	});
	
	$scope.tabs = [{upper: 'Chat', lower: 'chat'}, {upper: 'Members', lower: 'members'}, {upper: 'Voicemails', lower: 'voicemails'}, {upper: 'Page', lower: 'page'}];

	// $scope.tabs = ['Chat', 'Members', 'Voicemails', 'Page'];
	
	// when url includes '/chat' --> $scope.seleted === 'Chat' --> brings in Chat View & Controller
	if ($location.path().indexOf('/chat') !== -1){
		// console.log('chat location path - ', $location.path());
		$scope.selected = 'Chat';
		// console.log('scope selected - ', $scope.selected);
	}  else if ($location.path().indexOf('/members') !== -1){
		// console.log('members location path - ', $location.path());
		$scope.selected = 'Members';
		// console.log('scope selected - ', $scope.selected);
	} else if ($location.path().indexOf('/voicemails') !== -1){
		// console.log('voicemails location path - ', $location.path());
		$scope.selected = 'Voicemails';
		// console.log('scope selected - ', $scope.selected);
	} else if ($location.path().indexOf('/page') !== -1){
		// console.log('page location path - ', $location.path());
		$scope.selected = 'Page';
		// console.log('scope selected - ', $scope.selected);
	}

	// $scope.selected = $location.path().indexOf('/chat') != -1 ? 'Chat' : 'Members';
	
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