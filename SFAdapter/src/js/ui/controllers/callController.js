/**
 * 123
 */
namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter, $sce, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var durationTimer = null;
    var callLogInfoTimeout = null;
    var timeSync = new fjs.utils.TimeSync();
    var lastPhone = null;
    var context = this;
    var callLogSaveTimeout = null;
    var sfApiProvider = sfApi.getProvider();
    var clientSettingsModel = dataManager.getModel('clientsettings');

    $scope.getTriangle = function() {
        return $sce.trustAsHtml($scope.call.mycallsclient_callLog.isOpened ? fjs.controllers.CallController.OPENED_TRIANGLE : fjs.controllers.CallController.CLOSED_TRIANGLE);
    };

    var tabsSynchronizer = new fjs.api.TabsSynchronizer();
    var masterListener = function() {
        if(tabsSynchronizer.isMaster) {
            startGetCallLogInfo();
        }
        else {
            stopGetCallInfo();
        }
    };

    tabsSynchronizer.addEventListener("master_changed", masterListener);

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
        if(context) {
            if ($scope.call.fillCallLogData(data, clientSettingsModel)) {
                saveCallLogChanges();
                context.safeApply($scope);
            }
        }
    }

    function getCallLogInfo() {
        stopGetCallInfo();
        lastPhone = $scope.call.phone;
        if(lastPhone) {
            var rawPhone =  $scope.call.phone.replace(/\(|\)|-/g, ''); //TODO check other symbols (+, *)
            if(rawPhone.length > 10) {
                rawPhone = rawPhone.slice(rawPhone.length - 10, rawPhone.length);
            }
            if($scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
                var message = {};
                message.action = "getPhoneInfo";
                message.data = {};
                message.data.phone = rawPhone;
                message.data.callType = ($scope.call.incoming ? "inbound" : "outbound");
                message.data.isRinging = ($scope.call.state == 0);
                message.callback = callInfoCallback;
                sfApiProvider.sendAction(message);
            }
            startGetCallLogInfo();
        }
    }

    $scope.showAddButton = function() {
        return $scope.call.mycallsclient_callLog.related.length == 0 && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE;
    };

    $scope.showWhatSelect = function() {
        var who = $scope.call.findCallLogTargetById($scope.call.mycallsclient_callLog.whoId);
        return $scope.call.getWhat() && (!who || who.object!='Lead');
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
            else {
                var what = $scope.call.getWhat();
                $scope.call.mycallsclient_callLog.whatId = what && what._id;
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
            callLogSaveTimeout = null;
        }
        callLogSaveTimeout = setTimeout(function() {

            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.noteChange = function() {
        saveCallLogChanges();
    };


    $scope.$watch("call.phone", function() {
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
        $scope.call.mycallsclient_callLog.tranferOpened = true;
        $scope.call.mycallsclient_callLog.isOpened = false;
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

    $scope.$on("$destroy", function() {
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
        tabsSynchronizer.removeEventListener("master_changed", masterListener);
        stopGetCallInfo();
        if($scope.call.mycallsclient_callLog && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
            initCallLogSubject();
            var message = {};
            message.action = "addCallLog";
            message.data = {};
            message.data.subject = $scope.call.mycallsclient_callLog.subject;
            message.data.whoId =  $scope.call.mycallsclient_callLog.whoId;
            message.data.whatId = $scope.call.mycallsclient_callLog.whatId;
            message.data.note = $scope.call.mycallsclient_callLog.note;
            message.data.callType =  ($scope.call.incoming ? "inbound" : "outbound");
            message.data.duration = Math.round((new Date().getTime()- ($scope.call.created + timeSync.getDefault()))/1000);
            message.data.date = $scope.call.mycallsclient_callLog.date;
            message.callback =  function(response) {
                fjs.utils.Console.error(response);
            };
            sfApiProvider.sendAction(message);

        }
        context = null;
        clearTimeout(callLogSaveTimeout);
    });

    function initCallLogSubject() {
        if($scope.call.mycallsclient_callLog.note && $scope.call.mycallsclient_callLog.note != "") {
            $scope.call.mycallsclient_callLog.subject = "Call: " + $scope.call.mycallsclient_callLog.note.substr(0, 240) + " ...";
        }
        else {
            $scope.call.mycallsclient_callLog.subject = "Call";
        }
    }


    function stopGetCallInfo() {
        if(callLogInfoTimeout) {
            $timeout.cancel(callLogInfoTimeout);
            callLogInfoTimeout = null;
        }
    }

    function startGetCallLogInfo() {
        callLogInfoTimeout = $timeout(getCallLogInfo, fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC);
    }
};

fjs.controllers.CallController.extend(fjs.controllers.CommonController);

fjs.controllers.CallController.CONFERENCE_CALL_TYPE = 0;
fjs.controllers.CallController.SYSTEM_CALL_TYPE = 7;
fjs.controllers.CallController.HOLD_CALL_TYPE = 3;
fjs.controllers.CallController.RING_CALL_TYPE = 0;
fjs.controllers.CallController.TALCKING_CALL_TYPE = 2;
fjs.controllers.CallController.OPENED_TRIANGLE = "&#9660;";
fjs.controllers.CallController.CLOSED_TRIANGLE = "&#9658;";
fjs.controllers.CallController.SORT_FIELD_NAME = "Name";
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 3000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 1000;
