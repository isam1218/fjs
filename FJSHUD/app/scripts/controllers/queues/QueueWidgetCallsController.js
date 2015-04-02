hudweb.controller('QueueWidgetCallsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'ContactService', function($scope, $rootScope, $routeParams, httpService, contactService) {
	$scope.queueId = $routeParams.queueId;
	$scope.query = "";
	
	$scope.callsWaiting = [];
	$scope.callsActive = [];
	$scope.showWaiting = true;
	$scope.showActive = true;
	$scope.longestWait = 0;
	$scope.longestActive = 0;
	
	httpService.getFeed('queues');
	
	$scope.$on('queues_updated', function(event, data) {
		var queues = data.queues;
		
		$scope.callsWaiting = [];
		$scope.callsActive = [];
		$scope.longestWait = new Date().getTime();
		$scope.longestActive = new Date().getTime();
		
		for (i = 0; i < queues.length; i++) {
			if (queues[i].xpid == $scope.queueId && queues[i].calls) {
				var calls = queues[i].calls;
				
				// find calls for this queue
				for (c = 0; c < calls.length; c++) {
					// attach ringing agent
					if (calls[c].agentContactId)
						calls[c].agent = contactService.getContact(calls[c].agentContactId);
					
					if (calls[c].taken) {
						$scope.callsActive.push(calls[c]);
						
						if (calls[c].startedAt < $scope.longestActive)
							$scope.longestActive = calls[c].startedAt;
					}
					else {
						$scope.callsWaiting.push(calls[c]);
						
						if (calls[c].startedAt < $scope.longestWait)
							$scope.longestWait = calls[c].startedAt;
					}
				}
			}
		}
	});
}]);
