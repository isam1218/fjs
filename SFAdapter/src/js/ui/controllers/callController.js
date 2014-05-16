/**
 * 123
 */
namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var callsFeedModel = dataManager.getModel("mycallsclient");
    var durationTimer = null;
    var callLogInfoTimeout = null;
    var timeSync = new fjs.utils.TimeSync();
    var lastPhone = null;
    var context = this;
    var callLogSaveTimeout = null;
    var sfApiProvider = sfApi.getProvider();
    var whatId;
    var whoId;
    var fields = [];
    var what = [];
    var who = [];

    $scope.templatePath = "templates/call_item.html";
    $scope.callLogPath = "templates/call_log.html";
    $scope.transferDialogPath = null;

    $scope.onHold=($scope.call.state == fjs.controllers.CallController.HOLD_CALL_TYPE);
    $scope.isRing=($scope.call.state == fjs.controllers.CallController.RING_CALL_TYPE);

    var tabsSynchronizer = new fjs.api.TabsSynchronizer();
    var masterListener = function() {
        if(tabsSynchronizer.isMaster){
            startGetCallLogInfo();
        }
        else {
            stopGetCallInfo();
        }
    };
    tabsSynchronizer.addEventListener("master_changed", masterListener);

    if(!$scope.call.mycallsclient_callLog) {
        $scope.call.mycallsclient_callLog = {};
        $scope.call.mycallsclient_callLog.date = getCurrentDate();
        $scope.call.mycallsclient_callLog.subject = "Call";
        $scope.call.mycallsclient_callLog.xpid = $scope.call.xpid;
        $scope.call.mycallsclient_callLog.isOpened = true;
        $scope.call.mycallsclient_callLog.note = "";
        $scope.call.mycallsclient_callLog.callType = ($scope.call.incoming ? "inbound" : "outbound");
        $scope.call.mycallsclient_callLog.triangle = fjs.controllers.CallController.OPENED_TRIANGLE;
    }

    if($scope.call.mycallsclient_isOpened == undefined && $scope.isRing ||
        ($scope.call.type == fjs.controllers.CallController.CONFERENCE_CALL_TYPE && $scope.call.state == fjs.controllers.CallController.TALCKING_CALL_TYPE &&
            ($scope.call.mycallsclient_isOpened || $scope.call.mycallsclient_isOpened == undefined))) {
        $scope.$emit("selectCall", $scope.call);
    }

    function onDurationTimeout () {
        var date = new Date();
        var time =  date.getTime()-  timeSync.getDefault() + (new Date(1).getTimezoneOffset() * 1000 * 60);
        var timeDur = time - $scope.call.created;
        var timeHoldDur = time - $scope.call.holdStart;

        $scope.duration = $filter('date')(new Date(timeDur), 'HH:mm:ss ');
        $scope.call.duration = date.getTime()- ($scope.call.created + timeSync.getDefault());
        if($scope.onHold)   {
            $scope.holdDuration = $filter('date')(new Date(timeHoldDur), 'HH:mm:ss ');
        }
        durationTimer = $timeout(onDurationTimeout, fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC);
    }
    onDurationTimeout();

    function callInfoCallback(data){
        var results={};
        var lastResult = null;
        var resultsCount = 0;
        what = [];
        who = [];
        whatId = null;
        whoId = null;
        fields = [];
        if(data && data.result) {
            var result = JSON.parse(data.result);
            for(var i in result) {
                if(result.hasOwnProperty(i) && i!="screenPopUrl") {
                    resultsCount++;
                    var _result = lastResult = result[i];
                    if(!results[_result.object]) {
                        results[_result.object] = []
                    }
                    _result._id = i;
                    if(_result.object == "Contact" || _result.object == "Lead") {
                        who.push(_result);
                    }
                    else {
                        if(_result.object == "Case") {
                            _result.Name = _result.CaseNumber;
                        }
                        what.push(_result);
                    }
                    results[_result.object].push(_result);
                }
            };
            initCallLogFields(resultsCount, lastResult, results, fields);
        }
        createCallLog();
        if(isCallLogChanged()){
            $scope.call.mycallsclient_callLog.fields = fields;
            $scope.call.mycallsclient_callLog.whatId = whatId;
            $scope.call.mycallsclient_callLog.whoId = whoId;
            $scope.call.mycallsclient_callLog.who = who;
            $scope.call.mycallsclient_callLog.what = what;
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        }
        context.safeApply($scope);
    }

    function isCallLogChanged(){
        var changed = false;
        if(whatId != $scope.call.mycallsclient_callLog.whatId ||whoId != $scope.call.mycallsclient_callLog.whoId) {
            changed = true;
        }
        else {
            var i = 0;
            if($scope.call.mycallsclient_callLog.fields && $scope.call.mycallsclient_callLog.fields.length != fields.length) {
                changed = true;
            }
            else if($scope.call.mycallsclient_callLog.fields) {
                for (i = 0; i < $scope.call.mycallsclient_callLog.fields.length; i++) {
                    var j = 0;
                    var count = 0;
                    for (j = 0; j < fields.length; j++) {
                        if (fields[j]["id"] != $scope.call.mycallsclient_callLog.fields[i]["id"]) {
                            count++;
                        }
                    }
                    if (count == fields.length) {
                        changed = true;
                        break;
                    }
                }
            } else {
                changed = true;
            }
        }
        return changed;
    }

    function getCallLogInfo() {
        stopGetCallInfo();
        lastPhone = $scope.call.phone;
        if(lastPhone) {
            var rawPhone =  $scope.call.phone.replace(/\(|\)|-/g, '');
            if(rawPhone.length > 10){
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
            else {
                createCallLog();
                dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
            }
            startGetCallLogInfo();
        }
    }

    function initCallLogFields(resultsCount, lastResult, results) {
        if(resultsCount==1) {
            for(var i in lastResult) {
                if(lastResult.hasOwnProperty(i)) {
                    if(i!="object" && i!="_id") {
                        fields.push({title:i, value:lastResult[i], id:lastResult["_id"]});
                    }
                }
            }
        }
        else {
            for(var i in results) {
                var _result = results[i];
                _result.sort(sortFieldName);
                fields.push({title:i+" ("+_result.length+")", value:_result[0][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[0]["_id"]});
                for(var j=1; j < _result.length; j++) {
                    fields.push({ title:"", value:_result[j][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[j]["_id"]});
                }
            }
        }
    }

    function sortFieldName(a, b) {
        if(a[fjs.controllers.CallController.SORT_FIELD_NAME] && a[fjs.controllers.CallController.SORT_FIELD_NAME]) {
            var str1 = a[fjs.controllers.CallController.SORT_FIELD_NAME].toLowerCase();
            var str2 = b[fjs.controllers.CallController.SORT_FIELD_NAME].toLowerCase();
            if (str1 < str2) return -1;
            if (str1 > str2) return 1;
        }
        return 0;
    }

    function createCallLog() {
        //choose record from click-to-dial
        if(dataManager.phoneMap[$scope.call.phone]) {
            var calleeInfo = dataManager.phoneMap[$scope.call.phone];
            if(calleeInfo.type == "Contact") {
                whoId = calleeInfo.id;
                initWhatId(0, what, whatId);
            }
            else if(calleeInfo.type == "Lead") {
                whoId = calleeInfo.id;
            }
            else if(who){
                whatId = calleeInfo.id;
                for(var i = 0; i < who.length; i++) {
                    if(who[i].object == "Contact") {
                        whoId = who[i]._id;
                        break;
                    }
                }
            }
            delete dataManager.phoneMap[$scope.call.phone];
        }//the first time
        else if(!dataManager.phoneMap[$scope.call.phone] && !$scope.call.mycallsclient_callLog.whatId && !$scope.call.mycallsclient_callLog.whoId){
            if(who && who[0]) {
                whoId = who[0]["_id"];
                if(!isWhoIsLeadByIndex(0)) {
                    initWhatId(0);
                }
            }
            else {
                if(!isWhoIdIsLead()) {
                    initWhatId(0);
                }
            }
        } else if($scope.call.mycallsclient_callLog && $scope.call.mycallsclient_callLog.whoId && who){
            var hasWhoId = false;
            for(var i = 0; i < who.length; i++) {
                if(who[i]["_id"] == $scope.call.mycallsclient_callLog.whoId) {
                    whoId = $scope.call.mycallsclient_callLog.whoId;
                    whatId =  $scope.call.mycallsclient_callLog.whatId;
                    hasWhoId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                if($scope.call.mycallsclient_callLog.who && who[0]) {
                    whoId = who[0]["_id"];
                }
            }
        }
        else if($scope.call.mycallsclient_callLog && whatId && what){
            var hasWhatId = false;
            for(var i = 0; i < what.length; i++) {
                if(what[i]["_id"] == whatId) {
                    hasWhatId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                initWhatId(0);
            }
        }
    }

    $scope.whoChange = function() {
        if($scope.call.mycallsclient_callLog && $scope.call.mycallsclient_callLog.who) {
            for(var i = 0; i < $scope.call.mycallsclient_callLog.who.length; i++) {
                if( $scope.call.mycallsclient_callLog.who[i]["_id"]  == $scope.call.mycallsclient_callLog.whoId) {
                    if(($scope.call.mycallsclient_callLog.who[i] && $scope.call.mycallsclient_callLog.who[i]["object"]  == "Lead")) {
                        $scope.call.mycallsclient_callLog.whatId = null;
                    }
                    else {
                        if($scope.call.mycallsclient_callLog.whatId == null && $scope.call.mycallsclient_callLog.what != null && $scope.call.mycallsclient_callLog.what[0] != null) {
                            $scope.call.mycallsclient_callLog.whatId = $scope.call.mycallsclient_callLog.what[0]["_id"];
                        }
                    }
                    break;
                }
            }
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        }
    };

    $scope.whatChange = function() {
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    };

    function isWhoIdIsLead() {
        if(hasWho()) {
            for(var i = 0; i < who.length; i++) {
                if(who[i]["_id"] == whoId) {
                    return isWhoIsLeadByIndex(i);
                }
            }
        }
    }

    function hasWho() {
        return $scope.call.mycallsclient_callLog != null && who != null && whoId != null;
    }

    function initWhatId(index) {
        if(whatId == null && what != null && what[index] != null) {
            whatId = what[index]["_id"];
        }
    }

    function isWhoIsLeadByIndex(index) {
        return (who[index] && who[index]["object"]  == "Lead");
    }

    function onCallLogChanged() {
        if(callLogSaveTimeout != null) {
            clearTimeout(callLogSaveTimeout);
            callLogSaveTimeout = null;
        }
        callLogSaveTimeout = setTimeout(function() {
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.noteChange = function() {
        onCallLogChanged();
    };

    $scope.$watch("call.state", function() {
        $scope.onHold=($scope.call.state == fjs.controllers.CallController.HOLD_CALL_TYPE);
        if(!$scope.onHold) {
            var date =  new Date(0).getTime() + (new Date(0).getTimezoneOffset() * 1000 * 60);
            $scope.holdDuration = $filter('date')(date, 'HH:mm:ss ');
        }
        $scope.isRing=($scope.call.state == fjs.controllers.CallController.RING_CALL_TYPE);
    }, true);

    $scope.$watch("call.phone", function() {
        getCallLogInfo();
    });

    function getCurrentDate() {
        var d = new Date();
        return d.getFullYear()+"-"+ (d.getMonth()+1) +"-"+d.getDate();
    }

    $scope.showDetails = function() {
        $scope.$emit("toggleCall", $scope.call);
    };

    $scope.hold = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferToHold", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.accept = function() {
        dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "answer", {"mycallId":$scope.call.xpid });
        return false;
    };

    $scope.transfer = function() {
        $scope.transferDialogPath = "templates/transfer_dialog.html";
        $scope.isTransferDialogClass = "call-item-transfer-opened";
        if($scope.callLogPath) {
            closeCallLog();
        }
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
        $scope.call.mycallsclient_callLog.triangle = fjs.controllers.CallController.CLOSED_TRIANGLE;
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    }

    function openCallLog() {
        $scope.call.mycallsclient_callLog.isOpened = true;
        $scope.call.mycallsclient_callLog.triangle = fjs.controllers.CallController.OPENED_TRIANGLE;
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    }

    function closeTransfer() {
        $scope.transferDialogPath=null;
        $scope.isTransferDialogClass="";
    }

    $scope.toggleCallLog = function() {
        if($scope.call.mycallsclient_callLog.isOpened) {
            closeCallLog();
        }
        else {
            openCallLog();
            closeTransfer();
        }
    };

    $scope.openSFLink = function(id) {
        var message = {};
        message.action = "openUser";
        message.data = {};
        message.data.id = id;
        sfApiProvider.sendAction(message);
    };

    $scope.$on('closeDialog', function(event, key) {
        closeTransfer();
        openCallLog();
    });

    $scope.$on('transfer', function(event, number) {
        if(number && number != "") {
            dataManager.sendAction(fjs.model.MyCallsFeedModel.NAME, "transferTo", {"mycallId":$scope.call.xpid, "toNumber":number });
        }
        closeTransfer();
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
            message.data.duration = Math.round($scope.call.duration/1000);
            message.data.date = $scope.call.mycallsclient_callLog.date;
            message.callback =  function(response){
                fjs.utils.Console.error(response);
            };
            sfApiProvider.sendAction(message);
        }
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

    $scope.$watch("call.mycallsclient_isOpened", function() {
        if($scope.call.mycallsclient_isOpened) {
            if(!callLogInfoTimeout) {
                startGetCallLogInfo();
            }
        }
        else {
            stopGetCallInfo();
        }
    });

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
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 500;
