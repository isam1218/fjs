namespace("fjs.controllers");

fjs.controllers.CallLogsController = function($scope, dataManager) {
    this.callLogsFeedModel = dataManager.getModel("clientcalllog");
    
    var context = this;

    fjs.controllers.CommonController.call(this, $scope);
    
    $scope.logs = this.callLogsFeedModel.order;

    this.completeCallLogsListener = function() {
        context.safeApply($scope);
    };
    this.callLogsFeedModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeCallLogsListener);
};
fjs.controllers.CallLogsController.extend(fjs.controllers.CommonController);
