fjs.core.namespace("fjs.ui");

fjs.ui.ResentsListController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("widget_history");
    $scope.resents = $scope.model.items;
    $scope.model.addEventListener('complete', $scope.$safeApply);
};

fjs.core.inherits(fjs.ui.ResentsListController, fjs.ui.Controller);