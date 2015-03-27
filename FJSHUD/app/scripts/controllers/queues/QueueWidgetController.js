hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function($scope, $rootScope, $routeParams, httpService) {
    $scope.queueId = $routeParams.queueId;
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    
    $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
    $scope.selected = 'Agents';
    
    httpService.getFeed('queuelogoutreasons');
    httpService.getFeed('queues');
    httpService.getFeed('queue_members');
    httpService.getFeed('queue_members_status');
    httpService.getFeed('queue_stat_calls');
    
    
    $scope.$on('queues_updated', function(event, data) {
        var queues = data.queues;
        for (i = 0; i < queues.length && $scope.queue === undefined; i++) {
            if (queues[i].xpid == $scope.queueId) {
                $scope.queue = queues[i];
            }
        
        }
    });
}]);