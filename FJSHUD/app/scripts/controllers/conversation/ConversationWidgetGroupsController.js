hudweb.controller('ConversationWidgetGroupsController', ['$scope', '$routeParams', 'GroupService', 'ContactService', function($scope, $routeParams, groupService, contactService) {
    var context = this;
	var favoriteID;
	
    $scope.contactId = $routeParams.contactId;
    $scope.groups = [];
	$scope.userGroup;
    $scope.que = {};
    $scope.que.query = '';
    $scope.query = "";
	
	groupService.getGroups().then(function(data) {
		$scope.groups = data.groups;
		favoriteID = data.favoriteID;
		
		// find user's department
		var groups = $scope.groups;
		
		for (var i = 0, len = groups.length; i < len; i++) {
			if (!groups[i].ownerId) {
				for (var m = 0, mLen = groups[i].members.length; m < mLen; m++) {
					if (groups[i].members[m].contactId == $scope.contactId) {
						$scope.userGroup = groups[i];
						break;
					}
				}
			}
			
			if ($scope.userGroup) break;
		}
	});
	
	$scope.customFilter = function() {
		var query = $scope.que.query.toLowerCase();
		
		return function(group) {
			if (group.xpid != favoriteID && group != $scope.userGroup && groupService.isMember(group, $scope.contactId) && groupService.isMine(group.xpid)) {
				if (query == '' || group.name.toLowerCase().indexOf(query) != -1 || group.description.toLowerCase().indexOf(query) != -1)
					return true;
			}
		};
	};
	
	$scope.isTheirGroup = function() {
		if ($scope.userGroup && $scope.userGroup.name.toLowerCase().indexOf($scope.que.query.toLowerCase()) != -1)
			return true;
	};

	$scope.findGroupOwner = function(group){
		var owner = contactService.getContact(group.ownerId);
		return owner.displayName;
	};
	
    $scope.$on("$destroy", function() {
		
    });
}]);