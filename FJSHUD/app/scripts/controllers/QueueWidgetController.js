
fjs.ui.QueueWidgetController = function ($scope, $rootScope, $routeParams, myHttpService) {
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

};

fjs.core.inherits(fjs.ui.QueueWidgetController, fjs.ui.Controller);
