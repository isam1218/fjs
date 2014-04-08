namespace("fjs.controllers");

fjs.controllers.CallsListController = function($scope, dataManager) {
    var callsFeedModel = dataManager.getModel("mycalls");

    function getIndexByXpid (xpid) {
        if($scope.calls) {
            for(var i =0; i < $scope.calls.length; i++) {
                if($scope.calls[i].xpid == xpid)
                    return i;
            }
        }
        return -1;
    }

    callsFeedModel.addEventListener("push", function(data){
        console.log("Data push ", data);
            var index = getIndexByXpid(data.xpid);
            if(index < 0) {
                $scope.calls.push(data);
            }
            else {
                applyModelItem(index, data);
            }
            $scope.$apply();
    });

    callsFeedModel.addEventListener("changepid", function(data){
        console.log("Data changepid ", data);
            console.log("Sync Changepid", data);
            var index = getIndexByXpid(data.oldPid);
            if(index < 0) {
                $scope.calls.push(data.entry);
            }
            else {
                applyModelItem(index, data.entry);
            }
            $scope.$apply();
    });

    callsFeedModel.addEventListener("delete", function(data){
        console.log("Data delete ", data);
            console.log("Sync Delete", data);
            var index = getIndexByXpid(data.xpid);
            if(index > -1) {
                $scope.calls.splice(index, 1);
                $scope.$apply();
        }
    });

    var applyModelItem = function(index, entry) {
        var _entry = $scope.calls[index];
        if(_entry) {
            for(var key in entry) {
                if(entry.hasOwnProperty(key)) {
                    _entry[key] = entry[key];
                }
            }
        }
    };

    $scope.calls=[];

    callsFeedModel.addEventListener("complete", function(){
        var oldId = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID);
        var oldMode = localStorage.getItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE);
        if(oldId) {
            var index = getIndexByXpid(oldId);
            if(index >= 0) {
                if(oldMode == "true") {
                    selectCall($scope.calls[index], oldId);
                }
                else {
                    deselectCall($scope.calls[index]);
                }
            }
            else if($scope.calls.length > 0){
                selectCall($scope.calls[0], oldId);
            }
        }
        else if($scope.calls.length > 0){
           selectCall($scope.calls[0], oldId);
        }
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
        var oldSelectedIndex = getIndexByXpid(oldId);
        if(oldSelectedIndex >= 0) {
            $scope.calls[oldSelectedIndex].selected = false;
        }
        entry.selected = true;
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID, entry.xpid);
        localStorage.setItem(fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE, true);
    }
};

fjs.controllers.CallsListController.SELECTED_CALL_ID = "selected_call_id";
fjs.controllers.CallsListController.SELECTED_CALL_ID_MODE= "selected_call_id_mode";
