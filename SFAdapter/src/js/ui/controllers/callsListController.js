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

    $scope.$on('selectCall', function(event, entry) {
        selectCall(entry);
    });

    var deselectOldCall = function(newCallXpid) {
        for(var i = 0; i < $scope.calls.length; i++) {
            var call = $scope.calls[i];
            var xpid = call.xpid;
            if(xpid != newCallXpid && call.mycallsclient_isOpened) {
                deselectCall(call);
            }
        }
    };

    var deselectCall = function(entry) {
        if(entry.mycallsclient_isOpened) {
            var _entry = {};
            entry.mycallsclient_isOpened = _entry.isOpened = false;
            _entry.xpid = entry.xpid;
            if(_entry.xpid) {
                dataManager.sendAction("mycallsclient", "push", _entry);
                context.safeApply($scope);
            }
        }
    };

    var selectCall = function(entry) {
        if(!entry.mycallsclient_isOpened) {
            var _entry = {};
            entry.mycallsclient_isOpened = _entry.isOpened = true;
            _entry.xpid = entry.xpid;
            if(_entry.xpid) {
                dataManager.sendAction("mycallsclient", "push", _entry);
                context.safeApply($scope);
            }
        }
        deselectOldCall(entry.xpid);
    };
};

fjs.controllers.CallsListController.extend(fjs.controllers.CommonController);

fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
