namespace("fjs.controllers");
fjs.controllers.CallLogDialogController = function($scope, $element, $timeout, $filter, $sce, dataManager, sfApi) {

    fjs.controllers.CommonController(this);

    var callLogSaveTimeout = null;

    var _blockChangeNoteTM =null;

    var timeSync = new fjs.utils.TimeSync();

    var sfApiProvider = sfApi.getProvider();

    var findCallLogTargetById = function(id) {
        for (var i = 0; i < $scope.log.callLog.related.length; i++) {
            var item = $scope.log.callLog.related[i];
            if (item._id == id) {
                return item;
            }
        }
    };

    $scope.noteKeyPress = function() {

        $scope._blockChangeNote = true;

        if(_blockChangeNoteTM!=null) {
            clearTimeout(_blockChangeNoteTM);
            _blockChangeNoteTM = null;
        }
        _blockChangeNoteTM = setTimeout(function(){
            delete $scope._blockChangeNote;
            _blockChangeNoteTM = null;
        }, 1000);
    };

    $scope.whoChange = function() {
        var who = findCallLogTargetById($scope.log.callLog.whoId);
        if(who && who.object == 'Lead') {
            $scope.log.callLog.pervWhatId = $scope.log.callLog.whatId;
            $scope.log.callLog.whatId = null;
        }
        else if($scope.log.callLog.whatId == null) {
            if($scope.log.callLog.pervWhatId) {
                $scope.log.callLog.whatId = $scope.log.callLog.pervWhatId;
            }
        }
        saveCallLogChanges();
    };

    $scope.whatChange = function() {
        saveCallLogChanges();
    };

    $scope.getRelatedItemType = function(item) {
        return item.object == 'Contact' || item.object == 'Lead' ? 'who' : 'what';
    };

    $scope.getWho = function(notLead) {
        for(var i=0;i<$scope.log.callLog.related.length; i++) {
            var item = $scope.log.callLog.related[i];
            if($scope.getRelatedItemType(item)=='who' && (!notLead || item.object!='Lead')) return item;
        }
    };

    $scope.getWhat = function() {
        for(var i=0;i<$scope.log.callLog.related.length; i++) {
            var item = $scope.log.callLog.related[i];
            if($scope.getRelatedItemType(item)=='what') return item;
        }
    };

    $scope.showRelated = function() {
        var who = findCallLogTargetById($scope.log.callLog.whoId);
        return $scope.getWhat() && (!who || who.object!='Lead');
    };

    function saveCallLogChanges() {
        if(callLogSaveTimeout != null) {
            clearTimeout(callLogSaveTimeout);
        }
        callLogSaveTimeout = setTimeout(function() {
            dataManager.sendAction("clientcalllog", "push", {"callLog":  $scope.log.callLog, "xpid": $scope.log.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.noteChange = function() {
        saveCallLogChanges();
    };

    $scope.saveCallLog = function(){
        if($scope.log.callLog) {
            var message = {};
            message.action = "addCallLog";
            message.data = {};
            message.data.subject = $scope.log.callLog.subject;
            message.data.whoId = $scope.log.callLog.whoId;
            message.data.whatId = $scope.log.callLog.whatId;
            message.data.note = $scope.log.callLog.note;
            message.data.callType = ($scope.log.incoming ? "inbound" : "outbound");
            message.data.duration = Math.round((new Date().getTime() - ($scope.log.created + timeSync.getDefault())) / 1000);
            message.data.date = $scope.log.callLog.date;
            message.callback = function (response) {
                fjs.utils.Console.error(response);
            };
            sfApiProvider.sendAction(message);
        }
        $scope.closeDialog();
    };
    $scope.closeDialog = function() {
        dataManager.sendAction("clientcalllog", "delete", {"callLog":  $scope.log.callLog, "xpid": $scope.log.xpid});
    };
};

fjs.controllers.CallLogDialogController.extend(fjs.controllers.CommonController);
