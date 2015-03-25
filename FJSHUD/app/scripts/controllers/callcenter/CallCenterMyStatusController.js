hudweb.controller('CallCenterMyStatusController', ['$scope', '$rootScope', 'HttpService', function($scope, $rootScope, httpService) {
	
	httpService.getFeed('queues');
	
	$scope.$on('queues_updated', function() {
		angular.forEach($scope.queues, function(obj) {
			for (i = 0; i < obj.members.length; i++) {
				// we only care about ourselves
				if (obj.members[i].contactId == $rootScope.myPid)
					obj.me = obj.members[i];
			}
		});
	});
}]);
