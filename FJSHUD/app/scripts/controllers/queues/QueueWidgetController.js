hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', function($scope, $rootScope, $routeParams, httpService, queueService) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
	$scope.queue = queueService.getQueue($scope.queueId);
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
	
	// for chat
	$scope.enableChat = true;
	$scope.enableFileShare = true;
    
    $scope.tabs = [{upper: 'Agents', lower: 'agents'}, {upper: 'Stats', lower: 'stats'}, {upper: 'Calls', lower: 'calls'}, {upper: 'Chat', lower: 'chat'}, {upper: 'Call Log', lower: 'calllog'}, {upper: 'Recordings', lower: 'recordings'}, {upper: 'Alerts', lower: 'alerts'}];

    $scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;
    
    httpService.getFeed('queues');
    httpService.getFeed('queue_stat_calls');    
    
    $scope.$on('queues_updated', function(event, data) {
        var queues = data.queues;
		
        for (i = 0; i < queues.length; i++) {
            if (queues[i].xpid == $scope.queueId) {
                $scope.queue = queues[i];
            }
        }
    });
}]);