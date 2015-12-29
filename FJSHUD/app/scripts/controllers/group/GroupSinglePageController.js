hudweb.controller('GroupSinglePageController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'HttpService', function($scope, $rootScope, $routeParams, groupService, httpService) {
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
			if (member.contactId == $rootScope.myPid || !member.onPage){
				return false;
			}else{
				return true;
			} 
		};
	};

	// call action was selected
	$scope.makeCall = function(type) {
		$scope.action.selected = $scope.callOptions[0];
	
		if (type && type != '') {
	
			httpService.sendAction('groups', type, {
				contactId: $rootScope.myPid,
				groupId: $scope.groupId
			});
			
		}
	};
}]);