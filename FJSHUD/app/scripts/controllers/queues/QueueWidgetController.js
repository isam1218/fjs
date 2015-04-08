hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function($scope, $rootScope, $routeParams, httpService) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
	
	// for chat
	$scope.enableChat = true;
	$scope.feed = 'queues';
    $scope.targetAudience = "queue";
    $scope.targetType = "f.conversation.chat";
    
    $scope.tabs = [{upper: 'Agents', lower: 'agents'}, {upper: 'Stats', lower: 'stats'}, {upper: 'Calls', lower: 'calls'}, {upper: 'Chat', lower: 'chat'}, {upper: 'Call Log', lower: 'calllog'}, {upper: 'Recordings', lower: 'recordings'}];

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