hudweb.controller('QueueWidgetCallLogController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function($scope, $rootScope, $routeParams, myHttpService) {
  $scope.queueId = $routeParams.queueId;
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Call Log';

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

}]);
