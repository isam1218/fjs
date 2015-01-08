fjs.core.namespace("fjs.ui");

fjs.ui.QueueWidgetStatsController = function($scope, $routeParams, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this,  $scope, $routeParams, dataManager);

  $scope.context = this;
  $scope.dataManager = dataManager;
  $scope.queueId = $routeParams.queueId;


  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Stats';

  $scope.queuestatsmodel = dataManager.getModel("queue_stat_calls");
  $scope.queuestats = $scope.queuestatsmodel.items;

  $scope.queuestatsmodel.addEventListener('complete', function (data) {
    $scope.$safeApply();
  });

  $scope.queuestatsmodel.addEventListener("push", function (data) {
    $scope.$safeApply();
  });

};
fjs.core.inherits(fjs.ui.QueueWidgetStatsController, fjs.ui.Controller)

