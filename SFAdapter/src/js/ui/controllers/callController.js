namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var callsFeedModel = dataManager.getModel("mycallsclient");
    var durationTimer = null;
    var callLogInfoTimeout = null;
    var timeSync = new fjs.utils.TimeSync();
    var lastPhone = null;

    $scope.templatePath = "templates/call_item.html";
    $scope.callLogPath = "templates/call_log.html";
    $scope.transferDialogPath = null;

    $scope.triangle = ($scope.call.mycallsclient_callLog && !$scope.call.mycallsclient_callLog.isOpened) ? fjs.controllers.CallController.CLOSED_TRIANGLE : fjs.controllers.CallController.OPENED_TRIANGLE;

    $scope.fields = [];
    $scope.who=[];
    $scope.what=[];

    $scope.onHold=($scope.call.state == fjs.controllers.CallController.HOLD_CALL_TYPE);
    $scope.isRing=($scope.call.state == fjs.controllers.CallController.RING_CALL_TYPE);

    var context = this;

    callsFeedModel.addEventListener(fjs.controllers.CommonController.PUSH_LISTENER, function(entry) {
        if($scope.call.xpid == entry.xpid) {
            if($scope.call.mycallsclient_callLog) {
                $scope.triangle = ($scope.call.mycallsclient_callLog && !$scope.call.mycallsclient_callLog.isOpened)
                    ? fjs.controllers.CallController.CLOSED_TRIANGLE : fjs.controllers.CallController.OPENED_TRIANGLE;
            }
            context.safeApply($scope);
        }
    });

    if($scope.call.mycallsclient_isOpened == undefined && $scope.isRing ||
        ($scope.call.type == fjs.controllers.CallController.CONFERENCE_CALL_TYPE && $scope.call.state == fjs.controllers.CallController.TALCKING_CALL_TYPE)) {
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
        if(data && data.result) {
            var result = JSON.parse(data.result);
            $scope.what = [];
            $scope.who = [];
            for(var i in result) {
                if(result.hasOwnProperty(i) && i!="screenPopUrl") {
                    resultsCount++;
                    var _result = lastResult = result[i];
                    if(!results[_result.object]) {
                        results[_result.object] = []
                    }
                    _result._id = i;
                    if(_result.object == "Contact" || _result.object == "Lead") {
                        $scope.who.push(_result);
                    }
                    else {
                        if(_result.object == "Case") {
                            _result.Name = _result.CaseNumber;
                        }
                        $scope.what.push(_result);
                    }
                    results[_result.object].push(_result);
                }
            }
            initCallLogFields(resultsCount, lastResult, results);
        }
        createCallLog();
        context.safeApply($scope);
    }

    function getCallLogInfo() {
        lastPhone = $scope.call.phone;
        if(lastPhone) {
            var rawPhone =  $scope.call.phone.replace(/\(|\)|-/g, '');
            if(rawPhone.length > 10){
                rawPhone = rawPhone.slice(rawPhone.length - 10, rawPhone.length);
            }
            if($scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
                sfApi.getPhoneInfo(rawPhone, ($scope.call.incoming ? "inbound" : "outbound"), ($scope.call.state == 0), callInfoCallback);
            }
            else {
                createCallLog();
            }
            startGetCallLogInfo();
        }
    }

    function initCallLogFields(resultsCount, lastResult, results) {
        $scope.fields = [];
        if(resultsCount==1) {
            for(var i in lastResult) {
                if(lastResult.hasOwnProperty(i)) {
                    if(i!="object" && i!="_id") {
                        $scope.fields.push({title:i, value:lastResult[i], id:lastResult["_id"]});
                    }
                }
            }
        }
        else {
            for(var i in results) {
                var _result = results[i];
                _result.sort(sortFieldName);
                $scope.fields.push({title:i+" ("+_result.length+")", value:_result[0][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[0]["_id"]});
                for(var j=1; j < _result.length; j++) {
                    $scope.fields.push({ title:"", value:_result[j][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[j]["_id"]});
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
        if(!$scope.call.mycallsclient_callLog) {
            $scope.call.mycallsclient_callLog = $scope.call.mycallsclient_callLog = {};
            $scope.call.mycallsclient_callLog.note = "";
            $scope.call.mycallsclient_callLog.callType = ($scope.call.incoming ? "inbound" : "outbound");
            $scope.call.mycallsclient_callLog.date = getCurrentDate();
            $scope.call.mycallsclient_callLog.subject = "Call";
            $scope.call.mycallsclient_callLog.xpid = $scope.call.xpid;
            $scope.call.mycallsclient_callLog.isOpened = true;
        }

        //choose record from click-to-dial
        if(dataManager.phoneMap[$scope.call.phone] && $scope.call.mycallsclient_callLog && !$scope.call.mycallsclient_callLog.whatId && !$scope.call.mycallsclient_callLog.whoId) {
            var calleeInfo = dataManager.phoneMap[$scope.call.phone];
            if(calleeInfo.type == "Contact") {
                $scope.call.mycallsclient_callLog.whoId = calleeInfo.id;
                initWhatId(0);
            }
            else if(calleeInfo.type == "Lead") {
                $scope.call.mycallsclient_callLog.whoId = calleeInfo.id;
            }
            else if($scope.who){
                $scope.call.mycallsclient_callLog.whatId = calleeInfo.id;
                for(var i = 0; i < $scope.who.length; i++) {
                    if($scope.who[i].object == "Contact") {
                        $scope.call.mycallsclient_callLog.whoId = $scope.who[i]._id;
                        break;
                    }
                }
            }
            delete dataManager.phoneMap[$scope.call.phone];
        }//the first time
        else if(!dataManager.phoneMap[$scope.call.phone] && $scope.call.mycallsclient_callLog && !$scope.call.mycallsclient_callLog.whatId && !$scope.call.mycallsclient_callLog.whoId){
            if($scope.who && $scope.who[0]) {
                $scope.call.mycallsclient_callLog.whoId = $scope.who[0]["_id"];
                if(!isWhoIsLeadByIndex(0)) {
                    initWhatId(0);
                }
            }
            else {
                if(!isWhoIdIsLead()) {
                    initWhatId(0);
                }
            }
        } else if($scope.call.mycallsclient_callLog && $scope.call.mycallsclient_callLog.whoId && $scope.who){
            var hasWhoId = false;
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"] == $scope.call.mycallsclient_callLog.whoId) {
                    hasWhoId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                if($scope.who && $scope.who[0]) {
                    $scope.call.mycallsclient_callLog.whoId = $scope.who[0]["_id"];
                    if(!isWhoIsLeadByIndex(0)) {
                        initWhatId($scope.call.mycallsclient_callLog.whatId);
                    }
                }
                else {
                    if(!isWhoIdIsLead()) {
                        initWhatId($scope.call.mycallsclient_callLog.whatId);
                    }
                }
            }
        }
        else if($scope.call.mycallsclient_callLog && $scope.call.mycallsclient_callLog.whatId && $scope.what){
            var hasWhatId = false;
            for(var i = 0; i < $scope.what.length; i++) {
                if( $scope.what[i]["_id"] == $scope.mycallsclient_callLog.whatId) {
                    hasWhatId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                initWhatId(0);
            }
        }
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    }

    $scope.$watch("call.mycallsclient_callLog.whoId", function() {
        if(hasWho()) {
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"]  == $scope.call.mycallsclient_callLog.whoId) {
                    if( isWhoIsLeadByIndex(i)) {
                        $scope.call.mycallsclient_callLog.whatId = null;
                    }
                    else {
                        initWhatId(0);
                    }

                    break;
                }
            }
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        }
    }, true);

    function isWhoIdIsLead() {
        if(hasWho()) {
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"]  == $scope.call.mycallsclient_callLog.whoId) {
                    return isWhoIsLeadByIndex(i);
                }
            }
        }
    }

    function hasWho() {
        return $scope.call.mycallsclient_callLog != null && $scope.who != null && $scope.call.mycallsclient_callLog.whoId != null;
    }

    function initWhatId(index) {
        if($scope.call.mycallsclient_callLog.whatId == null && $scope.what != null && $scope.what[index] != null) {
            $scope.call.mycallsclient_callLog.whatId = $scope.what[index]["_id"];
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        }
    }

    function isWhoIsLeadByIndex(index) {
        return ($scope.who[index]["object"]  == "Lead");
    }

    var callLogSaveTimeout = null;

    function onCallLogChanged() {
        if(callLogSaveTimeout != null) {
            clearTimeout(callLogSaveTimeout);
            callLogSaveTimeout = null;
        }
        callLogSaveTimeout = setTimeout(function() {
            dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.$watch("call.mycallsclient_callLog.note", function() {
        onCallLogChanged();
    }, true);

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
        $scope.triangle = fjs.controllers.CallController.CLOSED_TRIANGLE;
        $scope.call.mycallsclient_callLog.isOpened = false;
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    }

    function openCallLog() {
        $scope.triangle = fjs.controllers.CallController.OPENED_TRIANGLE;
        $scope.call.mycallsclient_callLog.isOpened = true;
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
        sfApi.openUser(id, null);
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
        stopGetCallInfo();
        if($scope.call.mycallsclient_callLog && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
            initCallLogSubject();
            sfApi.addCallLog($scope.call.mycallsclient_callLog.subject, $scope.call.mycallsclient_callLog.whoId, $scope.call.mycallsclient_callLog.whatId,
                $scope.call.mycallsclient_callLog.note, ($scope.call.incoming ? "inbound" : "outbound"), Math.round($scope.call.duration/1000), $scope.call.mycallsclient_callLog.date,
                function(response){
                    console.error(response);
                });
        }
    });

    function initCallLogSubject() {
        if($scope.call.mycallsclient_callLog.note != "") {
            $scope.call.mycallsclient_callLog.subject = "Call: " + $scope.call.mycallsclient_callLog.note.substr(0, 240) + " ...";
        }
        else {
            $scope.call.mycallsclient_callLog.subject = "Call";
        }
    }

    $scope.$watch("call.selected", function() {
        if($scope.call.selected) {
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
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 1000;
