namespace("fjs.controllers");

fjs.controllers.CallsListController = function($scope, dataManager) {
    this.callsFeedModel = dataManager.getModel("mycallsclient");
    var context = this;

    fjs.controllers.CommonController.call(this, $scope);

    var clientSettingsModel = dataManager.getModel('clientsettings');

    $scope.calls = this.callsFeedModel.order;

    $scope.selectedCallId = clientSettingsModel.items['openedCall'] && clientSettingsModel.items['openedCall'].value;

    $scope.selectCall = function(callId) {
        if($scope.selectedCallId!=callId) {
            $scope.selectedCallId = callId;
        }
        else {
            $scope.selectedCallId = null;
        }
        dataManager.sendAction('clientsettings' , "push", {"xpid": 'openedCall', "value":  $scope.selectedCallId});
    };

    this.clientSettingsListener = function() {
        $scope.selectedCallId = clientSettingsModel.items['openedCall'] && clientSettingsModel.items['openedCall'].value;
        context.safeApply($scope);
    };

    this.completeCallsListener = function() {
        context.safeApply($scope);
    };
    clientSettingsModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.clientSettingsListener);
    this.callsFeedModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeCallsListener);
};

fjs.controllers.CallsListController.extend(fjs.controllers.CommonController);

fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
