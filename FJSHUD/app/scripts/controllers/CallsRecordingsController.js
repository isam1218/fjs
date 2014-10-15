fjs.core.namespace("fjs.ui");

fjs.ui.CallsRecordingsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("mycalls");
    $scope.calls = $scope.model.items;
    $scope.model.addEventListener('complete', $scope.$safeApply);
    $scope.openedCallId = null;


};
fjs.core.inherits(fjs.ui.CallsRecordingsController, fjs.ui.Controller)
