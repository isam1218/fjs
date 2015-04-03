hudweb.controller('QueueWidgetStatsController', ['$scope', '$routeParams', '$location', 'HttpService', 'ContactService', function ($scope, $routeParams, $location, httpService, contactService) {
  $scope.queueId = $routeParams.queueId;
  $scope.sortOrder = 'displayName';
  $scope.isAscending = false;
  $scope.queueMembers = [];

  httpService.getFeed('queues');
  
  $scope.setSort = function(select) {
	if ($scope.sortOrder == select)
	  $scope.isAscending = !$scope.isAscending;
    else if (select == 'displayName')
	  $scope.isAscending = false;
    else
	  $scope.isAscending = true;
	
	$scope.sortOrder = select;
  };

  $scope.$on('queues_updated', function (event, data) {
	var queues = data.queues;
	  
	// get queue members
    $scope.queueMembers = [];

	if ($scope.queue.members) {
		for (var i = 0; i < $scope.queue.members.length; i++) {
		  var member = $scope.queue.members[i];

		  // find other queues for this contact
		  member.otherQueues = [];
		  
		  for (q = 0; q < queues.length; q++) {
			// exclude this queue
			if (queues[q].xpid != $scope.queueId && queues[q].members) {
				for (m = 0; m < queues[q].members.length; m++) {
					if (queues[q].members[m].contactId == member.contactId) {
						// attach queue and agent stats
						member.otherQueues.push({
							queue: queues[q],
							stats: queues[q].members[m].stats
						});
					}
				}
			}
		  }
		  
		  member.fullProfile = contactService.getContact(member.contactId);  
		  $scope.queueMembers.push(member);
		}
	}
  });

  $scope.goToQueue = function(xpid) {
	  $location.path('/queue/' + xpid);
  };

  $scope.$on("$destroy", function () {

  });
}]);
