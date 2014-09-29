fjs.core.namespace("fjs.ui");

fjs.ui.LeftBarCallsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("mycalls");
    $scope.calls = $scope.model.items;
    $scope.model.addEventListener('complete', $scope.$safeApply);
    $scope.openedCallId = null;
    $scope.toogleCall = function(callxpid) {
        if($scope.openedCallId == callxpid) {
            $scope.openedCallId = null;
        }
        else {
            $scope.openedCallId = callxpid;
        }
    }
};

fjs.core.inherits(fjs.ui.LeftBarCallsController, fjs.ui.Controller);