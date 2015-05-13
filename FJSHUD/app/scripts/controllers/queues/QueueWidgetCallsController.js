hudweb.controller('QueueWidgetCallsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', function($scope, $rootScope, $routeParams, httpService, contactService, queueService) {
	$scope.queueId = $routeParams.queueId;
	$scope.query = "";
	
	$scope.callsWaiting = 0;
	$scope.callsActive = 0;
	$scope.longestWait = 0;
	$scope.longestActive = 0;
	$scope.showWaiting = true;
	$scope.showActive = true;
	
	$scope.filterActive = function(active) {
		return function(call) {
			if (active && call.taken)
				return true;
			else if (!active && !call.taken)
				return true;
		}
	};
	
	// listen for updates
	$scope.$watch('queue.calls', function() {
		$scope.callsWaiting = 0;
		$scope.callsActive = 0;
		$scope.longestWait = new Date().getTime();
		$scope.longestActive = new Date().getTime();
		
		for (var i = 0; i < $scope.queue.calls.length; i++) {
			// active calls
			if ($scope.queue.calls[i].taken) {
				$scope.callsActive++;
				
				// find longest				
				if ($scope.queue.calls[i].startedAt < $scope.longestActive)
					$scope.longestActive = $scope.queue.calls[i].startedAt;
			}
			// waiting
			else {
				$scope.callsWaiting++;
						
				// find longest				
				if ($scope.queue.calls[i].startedAt < $scope.longestWait)
					$scope.longestWait = $scope.queue.calls[i].startedAt;
			}
		}
	}, true);
}]);
