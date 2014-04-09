namespace("fjs.controllers");

fjs.controllers.CallsListController = function($scope, dataManager) {
    var callsFeedModel = dataManager.getModel("mycalls"), context =this;

    fjs.controllers.CommonController.call(this, $scope);

    $scope.calls = callsFeedModel.order;

    callsFeedModel.addEventListener("complete", function(){
        var oldId = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID);
        var oldMode = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE);
        if(oldId) {
            var oldCall = callsFeedModel.items[oldId];
            if(oldCall) {
                if(oldMode == "true") {
                    selectCall(oldCall, oldId);
                }
                else {
                    deselectCall(oldCall);
                }
            }
            else if($scope.calls.length > 0){
                selectCall($scope.calls[0], oldId);
            }
        }
        else if($scope.calls.length > 0){
           selectCall($scope.calls[0], oldId);
        }
        context.safeApply($scope);
    });

    $scope.$on('toggleCall', function(event, entry) {
        var oldId = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID);
        var oldMode = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE);
        if(entry.xpid == oldId) {
            if(oldMode == "true") {
                deselectCall(entry);
            }
            else {
                selectCall(entry, oldId);
            }
        }
        else {
            selectCall(entry, oldId);
        }
    });

    $scope.$on('selectCall', function(event, entry) {
        var oldId = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID);
        selectCall(entry, oldId);
    });

    var deselectCall = function(entry) {
        entry.selected = false;
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID, entry.xpid);
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE, false);
    };

    var selectCall = function(entry, oldId) {
        var oldCall = callsFeedModel.items[oldId];
        if(oldCall) {
            oldCall.selected = false;
        }
        entry.selected = true;
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID, entry.xpid);
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE, true);
    }
};

fjs.controllers.CallsListController.extend(fjs.controllers.CommonController);


fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
