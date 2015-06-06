hudweb.controller('GroupSinglePageController', ['$scope', '$rootScope', '$routeParams', 'GroupService','ContactService', 'HttpService', function($scope, $rootScope, $routeParams, groupService, contactService, httpService) {
	$scope.groupId = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupId);
	$scope.members = $scope.group.members;
	// console.error('group page members - ', $scope.members);
	$scope.action = {};
	 
	$scope.callOptions = [
		{text: $scope.verbage.Call, type: ''},
		{text: $scope.verbage.group_page, type: 'page'},
		{text: $scope.verbage.group_intercom, type: 'intercom'},
		{text: $scope.verbage.group_voicemail, type: 'voicemail'}
	];
	
	$scope.action.selected = $scope.callOptions[0];
	
	$scope.memberFilter = function(){
		return function(member){
			if (member.contactId == $rootScope.myPid)
				return false;
			else 
				return true;
		};
	};

	// call action was selected
	$scope.makeCall = function(type) {
		httpService.sendAction('groups', type, {
			contactId: $rootScope.myPid,
			groupId: $scope.groupId
		});
		
		$scope.action.selected = $scope.callOptions[0];
	};
}]);