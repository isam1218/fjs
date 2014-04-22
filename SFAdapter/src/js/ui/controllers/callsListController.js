namespace("fjs.controllers");

fjs.controllers.CallsListController = function($scope, dataManager) {
    this.callsFeedModel = dataManager.getModel("mycallsclient");
    var context = this;

    fjs.controllers.CommonController.call(this, $scope);
    $scope.calls = this.callsFeedModel.order;

    $scope.$on('toggleCall', function(event, entry) {
        if(entry.mycallsclient_isOpened) {
            deselectCall(entry);
        }
        else {
            selectCall(entry);
        }
    });

    this.completeCallsListener = function(){
        context.safeApply($scope);
    };

    this.callsFeedModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeCallsListener);

    $scope.$on('selectCall', function(event, entry) {
        selectCall(entry);
    });

    var deselectOldCall = function(newCallXpid) {
        for(var i = 0; i < $scope.calls.length; i++) {
            var xpid = $scope.calls[i].xpid;
            var entry = context.callsFeedModel.items[xpid];
            if(entry.xpid != newCallXpid && entry.mycallsclient_isOpened) {
                deselectCall(entry);
            }
        }
    };

    var deselectCall = function(entry) {
        if(entry.mycallsclient_isOpened) {
            var _entry = {};
            entry.mycallsclient_isOpened = _entry.isOpened = false;
            _entry.xpid = entry.xpid;
            console.log("!!!!!!Deselect call : " + _entry.xpid);
            dataManager.sendAction("mycallsclient", "push", _entry);
        }
    };

    var selectCall = function(entry) {
        if(!entry.mycallsclient_isOpened) {
            var _entry = {};
            entry.mycallsclient_isOpened = _entry.isOpened = true;
            _entry.xpid = entry.xpid;
            console.log("!!!!!!Select call : " + _entry.xpid);
            dataManager.sendAction("mycallsclient", "push", _entry);
        }
        deselectOldCall(entry.xpid);
    };
};

fjs.controllers.CallsListController.extend(fjs.controllers.CommonController);

fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
