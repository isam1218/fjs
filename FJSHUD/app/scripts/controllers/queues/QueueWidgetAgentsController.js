hudweb.controller('QueueWidgetAgentsController', ['$scope', '$rootScope', 'ContactService', 'QueueService', 'HttpService', function ($scope, $rootScope, contactService, queueService, httpService) {
  var addedPid;
  $scope.query = "";
  $scope.selectedSort = "displayName";
  $scope.agents = [];

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}';
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.storeRecentQueueMember = function(xpid){
    var localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
    $scope.recent[xpid] = {
      type: 'contact',
      time: new Date().getTime()
    };
    localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
    $rootScope.$broadcast('recentAdded', {info: xpid});
  };
  
  $scope.statusFilter = function(status) {
	return function(agent) {
		if (status == 'in') {
			if (agent.status && agent.status.status.indexOf('login') != -1)
				return true;
		}
		else {
			if (agent.status && agent.status.status.indexOf('login') == -1)
				return true;
		}
	};
  };

  queueService.getQueues().then(function() {	
	$scope.agents = $scope.queue.members;
  });
  
  // refresh list
  $scope.$on('queue_members_status_synced', function() {
	$scope.agents = $scope.queue.members;
  });

  $scope.$on("$destroy", function () {

  });

}]);
