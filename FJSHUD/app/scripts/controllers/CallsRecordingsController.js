fjs.core.namespace("fjs.ui");

fjs.ui.CallsRecordingsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("calllog");
    $scope.calls = $scope.model.items;
    $scope.model.addEventListener('complete', $scope.$safeApply);
    $scope.openedCallId = null;

    var update = function(data) {
        $scope.$safeApply();
    };

    $scope.model.addEventListener('push', update);

};
fjs.core.inherits(fjs.ui.CallsRecordingsController, fjs.ui.Controller)
