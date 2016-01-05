hudweb.controller('QueueWidgetStatsController', ['$scope', '$rootScope', '$routeParams', '$location', 'QueueService', 'SettingsService', function ($scope, $rootScope, $routeParams, $location, queueService, settingsService) {
  $scope.queueId = $routeParams.queueId;
  $scope.sortOrder = 'displayName';
  $scope.isAscending = false;
  $scope.queueMembers = [];
  $scope.iconSelected;
  
  settingsService.getSettings().then(function(data){
    $scope.sortOrder = localStorage['Queue_' + $routeParams.queueId + '_stat_sort_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Queue_' + $routeParams.queueId + '_stat_sort_of_' + $rootScope.myPid]) : 'displayName';
    $scope.isAscending = localStorage['Queue_' + $routeParams.queueId + '_isAscending_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Queue_' + $routeParams.queueId + '_isAscending_of_' + $rootScope.myPid]) : true;
  });

  $scope.setSort = function(select) {
  	if ($scope.sortOrder == select){
  	  $scope.isAscending = !$scope.isAscending;
    }
    else if (select == 'displayName'){
      $scope.isAscending = false;
    }
    else{
      $scope.isAscending = true;
    }

    $scope.sortOrder = select;
    localStorage['Queue_' + $routeParams.queueId + '_isAscending_of_' + $rootScope.myPid] = JSON.stringify($scope.isAscending);
    localStorage['Queue_' + $routeParams.queueId + '_stat_sort_of_' + $rootScope.myPid] = JSON.stringify(select);

    if (select == 'fullProfile.hud_status')
      $scope.iconSelected = 'fullProfile.hud_status';
    else if (select == 'status.status')
      $scope.iconSelected = 'status.status';
    else
      $scope.iconSelected = 'other';
  };

  queueService.getQueues().then(function(data) {
	// get queue members
	var queue = queueService.getQueue($scope.queueId);
	
	if (queue.members) {
		var queues = data.queues;
		$scope.queueMembers = queue.members;
	
		for (var i = 0, iLen = $scope.queueMembers.length; i < iLen; i++) {
			var member = $scope.queueMembers[i];
			
			// find other queues for this contact
			member.otherQueues = [];
			
			for (var q = 0, qLen = queues.length; q < qLen; q++) {
				// exclude this queue
				if (queues[q].xpid != $scope.queueId && queues[q].members) {
					for (var m = 0, mLen = queues[q].members.length; m < mLen; m++) {
						if (queues[q].members[m].contactId == member.contactId) {
							// attach queue and agent stats
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
