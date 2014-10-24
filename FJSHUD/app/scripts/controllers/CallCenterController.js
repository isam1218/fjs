fjs.core.namespace("fjs.ui");

fjs.ui.CallCenterController = function ($scope, dataManager) {
  fjs.ui.Controller.call(this, $scope);
  $scope.model = dataManager.getModel("queues");
  $scope.queues = $scope.model.items;
  $scope.model.addEventListener('complete', function (data) {
    $scope.$safeApply();
  });


  $scope.model.addEventListener("push", function (data) {
    $scope.$safeApply();
  });
};
fjs.core.inherits(fjs.ui.CallCenterController, fjs.ui.Controller)
