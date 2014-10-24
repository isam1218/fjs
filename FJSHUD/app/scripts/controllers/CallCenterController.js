fjs.core.namespace("fjs.ui");

fjs.ui.CallCenterController = function ($scope, dataManager) {
  fjs.ui.Controller.call(this, $scope);
  $scope.queuemodel = dataManager.getModel("queues");
  $scope.queues = $scope.queuemodel.items;

  $scope.queuemodel.addEventListener('complete', function (data) {
    $scope.$safeApply();
  });

  $scope.queuemodel.addEventListener("push", function (data) {
    $scope.$safeApply();
  });

  $scope.queuestatsmodel = dataManager.getModel("queue_stat_calls");
  $scope.queuestats = $scope.queuestatsmodel.items;

  $scope.queuestatsmodel.addEventListener('complete', function (data) {
    $scope.$safeApply();
  });

  $scope.queuestatsmodel.addEventListener("push", function (data) {
    $scope.$safeApply();
  });

};
fjs.core.inherits(fjs.ui.CallCenterController, fjs.ui.Controller)
