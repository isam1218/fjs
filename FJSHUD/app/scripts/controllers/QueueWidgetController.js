hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function($scope, $rootScope, $routeParams, myHttpService) {
    $scope.queueId = $routeParams.queueId;
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    $scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};
    
    $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
    $scope.selected = 'Agents';
    
    myHttpService.getFeed('queuelogoutreasons');
    myHttpService.getFeed('queues');
    myHttpService.getFeed('queue_members');
    myHttpService.getFeed('queue_members_status');
    myHttpService.getFeed('queue_stat_calls');
    
    
    $scope.$on('queues_updated', function(event, data) {
        var queues = data.queues;
        for (i = 0; i < queues.length && $scope.queue === undefined; i++) {
            if (queues[i].xpid == $scope.queueId) {
                $scope.queue = queues[i];
            }
        
        }
        
        $scope.$safeApply();
    });
    
    $scope.getAvatarUrl = function(index) {
        
        if ($scope.queue !== undefined) {
            if ($scope.queue.members[index] !== undefined) {
                var xpid = $scope.queue.members[index].xpid;
                return myHttpService.get_avatar(xpid, 14, 14);
            } 
            else
                return 'img/Generic-Avatar-14.png';
        
        }
    };
}]);