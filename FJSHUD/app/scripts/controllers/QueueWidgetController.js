fjs.core.namespace("fjs.ui");

fjs.ui.QueueWidgetController = function($scope, $routeParams, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this,  $scope, $routeParams, dataManager);
  $scope.dataManager = dataManager;
  $scope.queueId = $routeParams.queueId;

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Agents';

  $scope.queueMembersModel = dataManager.getModel("queue_members");
  $scope.members = [];//$scope.queueMembersModel.items;

  $scope.queueMembersModel.addEventListener('complete', function (data) {
    $scope.$safeApply();
  });

  $scope.queueMembersModel.addEventListener("push", function (data) {
    if (data.entry.queueId === $scope.queueId) {
      $scope.members.push(data.entry);
    }
    //$scope.$safeApply();
  });

};
fjs.core.inherits(fjs.ui.QueueWidgetController, fjs.ui.Controller)


