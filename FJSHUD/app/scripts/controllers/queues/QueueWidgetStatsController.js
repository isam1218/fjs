hudweb.controller('QueueWidgetStatsController', ['$scope', '$routeParams', '$location', 'HttpService', 'ContactService', 'QueueService', function ($scope, $routeParams, $location, httpService, contactService, queueService) {
  $scope.queueId = $routeParams.queueId;
  $scope.sortOrder = 'displayName';
  $scope.isAscending = false;
  $scope.queueMembers = [];
  
  $scope.setSort = function(select) {
	if ($scope.sortOrder == select)
	  $scope.isAscending = !$scope.isAscending;
    else if (select == 'displayName')
	  $scope.isAscending = false;
    else
	  $scope.isAscending = true;
	
	$scope.sortOrder = select;
  };

  queueService.getQueues().then(function(data) {
	// get queue members
	var queue = queueService.getQueue($scope.queueId);
	
	if (queue.members) {
		var queues = data.queues;
		$scope.queueMembers = queue.members;
	
		for (var i = 0; i < $scope.queueMembers.length; i++) {
			var member = $scope.queueMembers[i];
	
			// find other queues for this contact
			member.otherQueues = [];
			
			for (var q = 0; q < queues.length; q++) {
				// exclude this queue
				if (queues[q].xpid != $scope.queueId && queues[q].members) {
					for (var m = 0; m < queues[q].members.length; m++) {
						if (queues[q].members[m].contactId == member.contactId) {
							// attach queue and agent stats
							var loggedin = queues[q].members[m];
							member.otherQueues.push({
								queue: queues[q],
								stats: queues[q].members[m].stats,
								status: queues[q].members[m].status,
								
							});
						}
					}
				}
			}
		}
	}
  });

  $scope.goToQueue = function(xpid) {
	  $location.path('/queue/' + xpid);
  };

  $scope.$on("$destroy", function () {

  });
}]);
