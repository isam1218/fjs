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

    $scope.templatePath = "templates/call_item.html";
    $scope.callLogPath = "templates/call_log.html";
    $scope.transferDialogPath = null;

    $scope.onHold=($scope.call.state == fjs.controllers.CallController.HOLD_CALL_TYPE);
    $scope.isRing=($scope.call.state == fjs.controllers.CallController.RING_CALL_TYPE);

    if(!$scope.call.mycallsclient_callLog){
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
            $scope.call.mycallsclient_callLog.what = [];
            $scope.call.mycallsclient_callLog.who = [];
            for(var i in result) {
                if(result.hasOwnProperty(i) && i!="screenPopUrl") {
                    resultsCount++;
                    var _result = lastResult = result[i];
                    if(!results[_result.object]) {
                        results[_result.object] = []
                    }
                    _result._id = i;
                    if(_result.object == "Contact" || _result.object == "Lead") {
                        $scope.call.mycallsclient_callLog.who.push(_result);
                    }
                    else {
                        if(_result.object == "Case") {
                            _result.Name = _result.CaseNumber;
                        }
                        $scope.call.mycallsclient_callLog.what.push(_result);
                    }
                    results[_result.object].push(_result);
                }
            }
            initCallLogFields(resultsCount, lastResult, results);
        }
        createCallLog();
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
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
                var message = {};
                message.action = "getPhoneInfo";
                message.data = {};
                message.data.phone = rawPhone;
                message.data.callType = ($scope.call.incoming ? "inbound" : "outbound");
                message.data.isRinging = ($scope.call.state == 0);
                message.callback = callInfoCallback;
                sfApi.sendAction(message);
            }
            else {
                createCallLog();
                dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
            }
            startGetCallLogInfo();
        }
    }

    function initCallLogFields(resultsCount, lastResult, results) {
        $scope.call.mycallsclient_callLog.fields = [];
        if(resultsCount==1) {
            for(var i in lastResult) {
                if(lastResult.hasOwnProperty(i)) {
                    if(i!="object" && i!="_id") {
                        $scope.call.mycallsclient_callLog.fields.push({title:i, value:lastResult[i], id:lastResult["_id"]});
                    }
                }
            }
        }
        else {
            for(var i in results) {
                var _result = results[i];

                _result.sort(sortFieldName);
                $scope.call.mycallsclient_callLog.fields.push({title:i+" ("+_result.length+")", value:_result[0][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[0]["_id"]});
                for(var j=1; j < _result.length; j++) {
                    $scope.call.mycallsclient_callLog.fields.push({ title:"", value:_result[j][fjs.controllers.CallController.SORT_FIELD_NAME], id:_result[j]["_id"]});
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
                $scope.call.mycallsclient_callLog.whoId = calleeInfo.id;
                initWhatId(0);
            }
            else if(calleeInfo.type == "Lead") {
                $scope.call.mycallsclient_callLog.whoId = calleeInfo.id;
            }
            else if($scope.call.mycallsclient_callLog.who){
                $scope.call.mycallsclient_callLog.whatId = calleeInfo.id;
                for(var i = 0; i < $scope.call.mycallsclient_callLog.who.length; i++) {
                    if($scope.call.mycallsclient_callLog.who[i].object == "Contact") {
                        $scope.call.mycallsclient_callLog.whoId = $scope.call.mycallsclient_callLog.who[i]._id;
                        break;
                    }
                }
            }
            delete dataManager.phoneMap[$scope.call.phone];
        }//the first time
        else if(!dataManager.phoneMap[$scope.call.phone] && $scope.call.mycallsclient_callLog && !$scope.call.mycallsclient_callLog.whatId && !$scope.call.mycallsclient_callLog.whoId){
            if($scope.call.mycallsclient_callLog.who && $scope.call.mycallsclient_callLog.who[0]) {
                $scope.call.mycallsclient_callLog.whoId = $scope.call.mycallsclient_callLog.who[0]["_id"];
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
            for(var i = 0; i < $scope.call.mycallsclient_callLog.who.length; i++) {
                if( $scope.call.mycallsclient_callLog.who[i]["_id"] == $scope.call.mycallsclient_callLog.whoId) {
                    hasWhoId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                if($scope.call.mycallsclient_callLog.who && $scope.call.mycallsclient_callLog.who[0]) {
                    $scope.call.mycallsclient_callLog.whoId = $scope.call.mycallsclient_callLog.who[0]["_id"];
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
            for(var i = 0; i < $scope.call.mycallsclient_callLog.what.length; i++) {
                if( $scope.call.mycallsclient_callLog.what[i]["_id"] == $scope.mycallsclient_callLog.whatId) {
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
        if(hasWho()) {
            for(var i = 0; i < $scope.call.mycallsclient_callLog.who.length; i++) {
                if( $scope.call.mycallsclient_callLog.who[i]["_id"]  == $scope.call.mycallsclient_callLog.whoId) {
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
    };

    $scope.whatChange = function() {
        dataManager.sendAction("mycallsclient", "push", {"callLog":  $scope.call.mycallsclient_callLog, "xpid": $scope.call.xpid});
    };

    function isWhoIdIsLead() {
        if(hasWho()) {
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.call.mycallsclient_callLog.who[i]["_id"]  == $scope.call.mycallsclient_callLog.whoId) {
                    return isWhoIsLeadByIndex(i);
                }
            }
        }
    }

    function hasWho() {
        return $scope.call.mycallsclient_callLog != null && $scope.call.mycallsclient_callLog.who != null && $scope.call.mycallsclient_callLog.whoId != null;
    }

    function initWhatId(index) {
        if($scope.call.mycallsclient_callLog.whatId == null && $scope.call.mycallsclient_callLog.what != null && $scope.call.mycallsclient_callLog.what[index] != null) {
            $scope.call.mycallsclient_callLog.whatId = $scope.call.mycallsclient_callLog.what[index]["_id"];
        }
    }

    function isWhoIsLeadByIndex(index) {
        return ($scope.call.mycallsclient_callLog && $scope.call.mycallsclient_callLog.who[index]["object"]  == "Lead");
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
        sfApi.sendAction(message);
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
                console.error(response);
            };
            sfApi.sendAction(message);
        }
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
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 1000;
