hudweb.controller('QueueWidgetCallsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'ContactService', 'QueueService', 'NtpService', function($scope, $rootScope, $routeParams, httpService, contactService, queueService, ntpService) {
	$scope.queueId = $routeParams.queueId;
  $scope.que = {};
  $scope.que.query = '';

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
	$scope.$watchCollection('queue.calls', function() {
		$scope.callsWaiting = 0;
		$scope.callsActive = 0;

		$scope.longestWait = ntpService.calibrateTime(new Date().getTime());
		$scope.longestActive = ntpService.calibrateTime(new Date().getTime());

		for (var i = 0, iLen = $scope.queue.calls.length; i < iLen; i++) {
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
	});
}]);
