hudweb.controller('QueueWidgetStatsController', ['$scope', '$routeParams', '$location', 'ContactService', 'HttpService', function ($scope, $routeParams, $location, contactService, httpService) {
  $scope.queueId = $routeParams.queueId;

  $scope.queueMembers = [];

  httpService.getFeed('queues');
  httpService.getFeed('queue_members');
  httpService.getFeed('queue_members_status');
  httpService.getFeed('queue_stat_calls');
  httpService.getFeed('contacts');
  httpService.getFeed('contacts_synced');

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Stats';
  $scope.isAscending = true;
  $scope.sortColumn = 'name';

  $scope.sortBy = function (type) {

    switch (type) {
      case "name":
        $scope.queueMembers.sort(function (a, b) {
          if ($scope.isAscending) {
            return a.displayName.localeCompare(b.displayName);
          } else {
            return b.displayName.localeCompare(a.displayName);
          }
        });
        break;
      case "talkIdle":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.waiting - b.info.waiting;
            } else {
              return b.info.waiting - a.info.waiting;
            }
          } else {
            return 0;
          }
        });

        break;
      case "calls":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgWait - b.info.avgWait;
            } else {
              return b.info.avgWait - a.info.avgWait;
            }
          } else {
            return 0;
          }
        });
        break;
      case "avgTalk":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgTalk - b.info.avgTalk;
            } else {
              return b.info.avgTalk - a.info.avgTalk;
            }
          } else {
            return 0;
          }
        });
        break;
    }
    if ($scope.sortColumn == type) {
      $scope.isAscending = !$scope.isAscending;
    }
    $scope.sortColumn = type;
  };

  $scope.$on('queues_updated', function (event, data) {
	var queues = data.queues;
	  
	// get queue members
    $scope.queueMembers = [];

    for (var i = 0; i < $scope.queue.members.length; i++) {
      var member = contactService.getContact($scope.queue.members[i].contactId);

	  // find other queues for this contact
      member.otherQueues = [];
	  
	  for (q = 0; q < queues.length; q++) {
		// exclude this queue
		if (queues[q].xpid != $scope.queueId) {
			for (m = 0; m < queues[q].members.length; m++) {
				if (queues[q].members[m].contactId == member.xpid)
					member.otherQueues.push(queues[q]);
			}
		}
	  }
	  
      $scope.queueMembers.push(member);
    }
  });

  $scope.goToQueue = function(xpid) {
	  $location.path('/queue/' + xpid);
  };

  $scope.$on("$destroy", function () {

  });
}]);
