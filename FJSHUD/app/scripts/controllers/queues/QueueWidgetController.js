hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', '$location', 'HttpService', function($scope, $rootScope, $routeParams, $location, httpService) {
    $scope.queueId = $routeParams.queueId;
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    $scope.selected = 'Agents';
    
    $scope.tabs = [{upper: 'Agents', lower: 'agents'}, {upper: 'Stats', lower: 'stats'}, {upper: 'Calls', lower: 'calls'}, {upper: 'Call Log', lower: 'calllog'}, {upper: 'Recordings', lower: 'recordings'}];

    if ($location.path().indexOf('/agents') !== -1){
        $scope.selected = 'Agents';
    } else if ($location.path().indexOf('/stats') !== -1){
        $scope.selected = 'Stats';
    } else if ($location.path().indexOf('/calls') !== -1){
        $scope.selected = 'Calls';
    } else if ($location.path().indexOf('/calllog') !== -1){
        $scope.selected = 'Call Log';
    } else if ($location.path().indexOf('/recordings') !== -1){
        $scope.selected = 'Recordings';
    }
    
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