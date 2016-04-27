/**
 * 123
 */
namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter, $sce, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var durationTimer = null;
    var timeSync = new fjs.utils.TimeSync();
    var lastPhone = null;
    var context = this;
    var callLogSaveTimeout = null;
    var sfApiProvider = sfApi.getProvider();
    var clientSettingsModel = dataManager.getModel('clientsettings');
    var meModel = dataManager.getModel('me');
    var locationModel = dataManager.getModel('locations');

    $scope.getTriangle = function() {
        return $sce.trustAsHtml($scope.call.mycallsclient_callLog.isOpened ? fjs.controllers.CallController.OPENED_TRIANGLE : fjs.controllers.CallController.CLOSED_TRIANGLE);
    };

    $scope.isAutoAnswer = function() {
        var _currentLocationId = meModel.getProperty('current_location');
        var _currentLocation = locationModel.getEntryByXpid(_currentLocationId);
        return $scope.call.incoming && _currentLocation && _currentLocation.location_status_autoAnswer;
    };

    var onDurationTimeout = function() {
        var date = new Date();
        var time =  date.getTime()-  timeSync.getDefault() + (new Date(1).getTimezoneOffset() * 1000 * 60);
        var timeDur = time - $scope.call.created;
        var timeHoldDur = time - $scope.call.holdStart;

        $scope.call.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        if($scope.call.onHold()) {
            $scope.call.holdDuration = $filter('date')(new Date(timeHoldDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC);
    };
    onDurationTimeout();

    function callInfoCallback(data) {
            if ($scope.call.fillCallLogData(data, clientSettingsModel)) {
                saveCallLogChanges();
                if(context) {
                    context.safeApply($scope);
                }
            }
    }

    function getCallLogInfo(callback) {
        lastPhone = $scope.call.phone;
        if(lastPhone && (!$scope.call.mycallsclient_callLog._notNew || callback)) {
            if($scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
                var message = {};
                message.action = "getPhoneInfo";
                message.data = {};
                message.data.phone = $scope.call.getFormattedPhone();
                message.data.callType = ($scope.call.incoming ? "inbound" : "outbound");
                message.data.isRinging = ($scope.call.state == 0);
                message.callback = function(data){
                    callInfoCallback(data);
                    if(callback) {
                        callback(data);
                    }
                };
                sfApiProvider.sendAction(message);
            }
        }
    }

    var _blockChangeNoteTM =null;

    $scope.noteKeyPress = function() {

        $scope.call._blockChangeNote = true;

        if(_blockChangeNoteTM!=null) {
            clearTimeout(_blockChangeNoteTM);
            _blockChangeNoteTM = null;
        }
        _blockChangeNoteTM = setTimeout(function(){
            delete $scope.call._blockChangeNote;
            _blockChangeNoteTM = null;
        }, 1000);
    };

    $scope.showAddButton = function() {
        return $scope.call.mycallsclient_callLog.related.length == 0 && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE;
    };

    $scope.whoChange = function() {
        var who = $scope.call.findCallLogTargetById($scope.call.mycallsclient_callLog.whoId);
        if(who && who.object == 'Lead') {
            $scope.call.mycallsclient_callLog.pervWhatId = $scope.call.mycallsclient_callLog.whatId;
            $scope.call.mycallsclient_callLog.whatId = null;
        }
        else if($scope.call.mycallsclient_callLog.whatId == null) {
            if($scope.call.mycallsclient_callLog.pervWhatId) {
                $scope.call.mycallsclient_callLog.whatId = $scope.call.mycallsclient_callLog.pervWhatId;
            }
        }
        saveCallLogChanges()
    };

    $scope.whatChange = function() {
        saveCallLogChanges();
    };

    function saveCallLogChanges() {
        if(callLogSaveTimeout != null) {
            clearTimeout(callLogSaveTimeout);
        }
        callLogSaveTimeout = setTimeout(function() {
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.noteChange = function() {
        saveCallLogChanges();
    };

    $scope.$watch("call.phone", function(newPhone, oldPhone) {
        if(newPhone!=oldPhone) {
            $scope.call.mycallsclient_callLog._notNew = false;
        }
        getCallLogInfo();
    });

    $scope.hold = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferToHold", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.accept = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "answer", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.transfer = function() {
        if(!$scope.call.mycallsclient_callLog.tranferOpened) {
            $scope.call.mycallsclient_callLog.tranferOpened = true;
            $scope.call.mycallsclient_callLog.isOpened = false;
        }
        else {
            $scope.call.mycallsclient_callLog.tranferOpened = false;
            $scope.call.mycallsclient_callLog.isOpened = true;
        }
        saveCallLogChanges();
    };

    $scope.end = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "hangup", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.unhold = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferFromHold", {"mycallId":$scope.call.xpid });
        return false;
    };

    function closeCallLog() {
        $scope.call.mycallsclient_callLog.isOpened = false;
        saveCallLogChanges();
    }

    function openCallLog() {
        $scope.call.mycallsclient_callLog.isOpened = true;
        $scope.call.mycallsclient_callLog.tranferOpened = false;
        saveCallLogChanges();
    }

    $scope.toggleCallLog = function() {
        if($scope.call.mycallsclient_callLog.isOpened) {
            closeCallLog();
        }
        else {
            openCallLog();
        }
    };

    $scope.createContact = function() {
        new SFApi().openCreateContactDialog($scope.call.phone);
    };

    $scope.openSFLink = function(id) {
        var message = {};
        message.action = "openUser";
        message.data = {};
        message.data.id = id;
        sfApiProvider.sendAction(message);
    };

    $scope.closeTransferDialog = function() {
        openCallLog();
    };

    $scope.$on('transfer', function(event, number) {
        if(number) {
            dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferTo", {"mycallId":$scope.call.xpid, "toNumber":number });
        }
        openCallLog();
    });

    $scope.callLogAvailable = function() {
        return $scope.call.phone === '' || $scope.call.type == fjs.controllers.CallController.EXTERNAL_CALL;
    };

    $scope.$on("$destroy", function() {
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
        if($scope.call.type == fjs.controllers.CallController.EXTERNAL_CALL) {
            getCallLogInfo(function () {
                dataManager.sendAction("clientcalllog", "push", {
                    "callLog":  $scope.call.mycallsclient_callLog,
                    "incoming":$scope.call.incoming,
                    "created":$scope.call.created,
                    "ended":Date.now(),
                    "xpid": $scope.call.xpid
                });
            });
        }
        else if($scope.call.phone === '') {
            dataManager.sendAction("clientcalllog", "push", {
                "callLog":  $scope.call.mycallsclient_callLog,
                "incoming":$scope.call.incoming,
                "created":$scope.call.created,
                "ended":Date.now(),
                "xpid": $scope.call.xpid
            });
        }
        context = null;
        clearTimeout(callLogSaveTimeout);
    });
};

fjs.controllers.CallController.extend(fjs.controllers.CommonController);

fjs.controllers.CallController.CONFERENCE_CALL_TYPE = 0;
fjs.controllers.CallController.SYSTEM_CALL_TYPE = 7;
fjs.controllers.CallController.QUEUE_CALL_TYPE = 3;
fjs.controllers.CallController.EXTERNAL_CALL = 5;
fjs.controllers.CallController.HOLD_CALL_TYPE = 3;
fjs.controllers.CallController.RING_CALL_TYPE = 0;
fjs.controllers.CallController.TALCKING_CALL_TYPE = 2;
fjs.controllers.CallController.OPENED_TRIANGLE = "&#9660;";
fjs.controllers.CallController.CLOSED_TRIANGLE = "&#9658;";
fjs.controllers.CallController.SORT_FIELD_NAME = "Name";
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 3000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 500;
