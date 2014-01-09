namespace("fjs.ui");

fjs.ui.LeftBarCallsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("mycalls");
};

fjs.ui.LeftBarCallsController.extend(fjs.ui.Controller);