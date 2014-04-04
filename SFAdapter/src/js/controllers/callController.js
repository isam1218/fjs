namespace("fjs.controllers");
fjs.controllers.CallController = function($scope, $element, $timeout, $filter) {
    fjs.controllers.CommonController(this);
    var durationTimer = null;
    var callLogInfoTimeout = null;
    var fdp = fjs.fdp.SyncManager();
    var sfApi = new SFApi();
    var timeSync = new fjs.TimeSync();
    var lastPhone = null;
    $scope.templatePath = "templates/call_item.html";
    $scope.callLogPath = "templates/call_log.html";
    $scope.transferDialogPath = null;
    $scope.triangle = fjs.controllers.CallController.OPENED_TRIANGLE;
    $scope.fields = [];
    $scope.callLog = localStorage.getItem($scope.call.htCallId) && JSON.parse(localStorage.getItem($scope.call.htCallId));
    $scope.autoAnswer = $scope.call != null && $scope.call.incoming && !SFApp.currentDeviceAutoAnsver;
    $scope.who=[];
    $scope.what=[];
    $scope.onHold=($scope.call.state == fjs.controllers.CallController.HOLD_CALL_TYPE);
    $scope.isRing=($scope.call.state == fjs.controllers.CallController.RING_CALL_TYPE);
    $scope.predicate = 'Name';
    var controller = this;
    if($scope.isRing || ($scope.call.type == fjs.controllers.CallController.CONFERENCE_CALL_TYPE && $scope.call.state == fjs.controllers.CallController.TALCKING_CALL_TYPE)) {
        selectCall();
    }

    var locationFeedModel = SFApp.feedModels["location_status"];
    locationFeedModel.addListener("complete", function(data){
        $scope.autoAnswer = $scope.call != null && $scope.call.incoming && !SFApp.currentDeviceAutoAnsver;
    });

    var onDurationTimeout = function() {
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
    };

    onDurationTimeout();

    var getCallLogInfo = function() {
        lastPhone = $scope.call.phone;
        var context = this;
        var callback = function(data){
            var results={};
            var lastResult = null;
            var resultsCount = 0;
            if(data && data.result) {
                var result = JSON.parse(data.result);
                $scope.what = [];
                $scope.who = [];
                $scope.fields = [];
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
            }
            initCallLogFields(resultsCount, lastResult, results);
            createCallLog();
            localStorage.setItem($scope.call.htCallId, JSON.stringify($scope.callLog));
             controller.safeApply($scope);
        };
        var rawPhone =  $scope.call.phone.replace(/\(|\)|-/g, '');
        if(rawPhone.length > 10)
        {
            rawPhone = rawPhone.slice(rawPhone.length - 10, rawPhone.length);
        }
        if($scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
            sfApi.getPhoneInfo(rawPhone, ($scope.call.incoming ? "inbound" : "outbound"), ($scope.call.state == 0), callback);
        }
        else {
            createCallLog();
        }
        startGetCallLogInfo();
    };

    function initCallLogFields(resultsCount, lastResult, results) {
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
                var _result = results[i]
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
        if(!$scope.callLog) {
            $scope.callLog = {};
            $scope.callLog.note = "";
            $scope.callLog.callType = ($scope.call.incoming ? "inbound" : "outbound");
            $scope.callLog.date = getCurrentDate();
            $scope.callLog.subject = "Call";
        }
        //choose record from click-to-dial
        if(SFApp.phoneMap[$scope.call.phone] && !$scope.callLog.whatId && !$scope.callLog.whoId) {
            var calleeInfo = SFApp.phoneMap[$scope.call.phone];
            if(calleeInfo.type == "Contact") {
                $scope.callLog.whoId = calleeInfo.id;
                initWhatId(0);
            }
            else if(calleeInfo.type == "Lead") {
                $scope.callLog.whoId = calleeInfo.id;
            }
            else if($scope.who){
                $scope.callLog.whatId = calleeInfo.id;
                for(var i = 0; i < $scope.who.length; i++) {
                    if($scope.who[i].object == "Contact") {
                        $scope.callLog.whoId = $scope.who[i]._id;
                        break;
                    }
                }
            }
            delete SFApp.phoneMap[$scope.call.phone];
        }//the first
        else if(!SFApp.phoneMap[$scope.call.phone]&& !$scope.callLog.whatId && !$scope.callLog.whoId){
            if($scope.who && $scope.who[0]) {
                $scope.callLog.whoId = $scope.who[0]["_id"];
                if(!isWhoIsLeadByIndex(0)) {
                    initWhatId(0);
                }
            }
            else {
                if(!isWhoIdIsLead()) {
                    initWhatId(0);
                }
            }
        } else if($scope.callLog.whoId && $scope.who){
            var hasWhoId = false;
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"] == $scope.callLog.whoId) {
                    hasWhoId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                if($scope.who && $scope.who[0]) {
                    $scope.callLog.whoId = $scope.who[0]["_id"];
                    if(!isWhoIsLeadByIndex(0)) {
                        initWhatId($scope.callLog.whatId);
                    }
                }
                else {
                    if(!isWhoIdIsLead()) {
                        initWhatId($scope.callLog.whatId);
                    }
                }
            }
        }
        else if($scope.callLog.whatId && $scope.what){
            var hasWhatId = false;
            for(var i = 0; i < $scope.what.length; i++) {
                if( $scope.what[i]["_id"] == $scope.callLog.whatId) {
                    hasWhatId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                initWhatId(0);

            }
        }
    }

    $scope.$watch("callLog.whoId", function() {
        if(hasWho()) {
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"]  == $scope.callLog.whoId) {
                    if( isWhoIsLeadByIndex(i)) {
                        $scope.callLog.whatId = null;
                    }
                    else {
                        initWhatId(0);
                    }
                    break;
                }
            }
        }
    }, true);

    function isWhoIdIsLead() {
        if(hasWho()) {
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"]  == $scope.callLog.whoId) {
                    return isWhoIsLeadByIndex(i);
                }
            }
        }
    }

    function resetWhoId() {
        if(hasWho()) {
            var hasWhoId = false;
            for(var i = 0; i < $scope.who.length; i++) {
                if( $scope.who[i]["_id"]  == $scope.callLog.whoId) {
                    hasWhoId = true;
                    break;
                }
            }
            if(!hasWhoId) {
                $scope.callLog.whoId = null;
            }
        }
    }

    function resetWhatId() {
        if(hasWhat()) {
            var hasWhatId = false;
            for(var i = 0; i < $scope.what.length; i++) {
                if( $scope.what[i]["_id"]  == $scope.callLog.whatId) {
                    hasWhatId = true;
                    break;
                }
            }
            if(!hasWhatId) {
                $scope.callLog.whatId = null;
            }
        }
    }

    function hasWhat() {
        return $scope.callLog != null && $scope.what != null && $scope.callLog.whatId != null;
    }

    function hasWho() {
        return $scope.callLog != null && $scope.who != null && $scope.callLog.whoId != null;
    }

    function initWhatId(index) {
        if($scope.callLog.whatId == null && $scope.what != null && $scope.what[index] != null) {
            $scope.callLog.whatId = $scope.what[index]["_id"];
        }
    }

    function isWhoIsLeadByIndex(index) {
        return ($scope.who[index]["object"]  == "Lead");
    }

    var callLogSaveTimeout = null;
    function onCallLogChanged() {
        if(callLogSaveTimeout!=null) {
            clearTimeout(callLogSaveTimeout);
            callLogSaveTimeout = null;
        }
        callLogSaveTimeout = setTimeout(function() {
            console.log($scope.callLog);
            localStorage.setItem($scope.call.htCallId,JSON.stringify($scope.callLog));
        },fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC);
    }

    $scope.$watch("callLog.note", function() {
        if($scope.callLog && $scope.callLog.note != null && $scope.callLog.note != undefined) {
            if($scope.callLog.note != "") {
                $scope.callLog.subject = "Call: " + $scope.callLog.note.substr(0, 240) + " ...";
            }
            else {
                $scope.callLog.subject = "Call";
            }
        }
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

    $scope.$watch("SFApp.currentDeviceAutoAnsver", function() {
        $scope.autoAnswer = $scope.call != null && $scope.call.incoming && !SFApp.currentDeviceAutoAnsver;
    });

    function getCurrentDate() {
        var d = new Date();
        return d.getFullYear()+"-"+ (d.getMonth()+1) +"-"+d.getDate();
    }

    $scope.showDetails = function() {
        toggleCall();
    };

    function toggleCall() {
        $scope.$emit("toggleCall", $scope.call);
    }

    function selectCall() {
        $scope.$emit("selectCall", $scope.call);
    }

    $scope.hold = function() {
        fdp.sendAction(fjs.app.SFAdapter.MY_CALLS_FEED_NAME, "transferToHold", {"a.mycallId":$scope.call.xpid });
        return false;
    };

    $scope.accept = function() {
        fdp.sendAction(fjs.app.SFAdapter.MY_CALLS_FEED_NAME, "answer", {"a.mycallId":$scope.call.xpid });
        return false;
    };

    $scope.transfer = function() {
        $scope.transferDialogPath = "templates/transfer_dialog.html";
        $scope.isTransferDialogClass = "call-item-transfer-opened";
        $scope.callLogPath=null;
    };

    $scope.end = function() {
        fdp.sendAction(fjs.app.SFAdapter.MY_CALLS_FEED_NAME, "hangup", {"a.mycallId":$scope.call.xpid });
        return false;
    };

    $scope.unhold = function() {
        fdp.sendAction(fjs.app.SFAdapter.MY_CALLS_FEED_NAME, "transferFromHold", {"a.mycallId":$scope.call.xpid });
        return false;
    };

    $scope.toggleCallLog = function() {
        if($scope.callLogPath) {
            $scope.callLogPath = null;
            $scope.triangle = fjs.controllers.CallController.CLOSED_TRIANGLE;
        }
        else {
            $scope.callLogPath = "templates/call_log.html";
            $scope.transferDialogPath=null;
            $scope.isTransferDialogClass="";
            $scope.triangle = fjs.controllers.CallController.OPENED_TRIANGLE;
        }
    };

    $scope.openSFLink = function(id) {
        sfApi.openUser(id, null);
    };

    $scope.$on('closeDialog', function(event, key) {
        $scope.transferDialogPath=null;
        $scope.isTransferDialogClass="";
    });

    $scope.$on('transfer', function(event, number) {
        fdp.sendAction(fjs.app.SFAdapter.MY_CALLS_FEED_NAME, "transferTo", {"a.mycallId":$scope.call.xpid,"a.toNumber":number});
        $scope.transferDialogPath=null;
        $scope.isTransferDialogClass="";
    });

    $scope.$on("$destroy", function() {
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
        stopGetCallInfo();
        console.log("Destroy call");
        if(localStorage.getItem($scope.call.htCallId)) {
            localStorage.removeItem($scope.call.htCallId);
            if($scope.callLog && $scope.call.type != fjs.controllers.CallController.SYSTEM_CALL_TYPE) {
                console.log("Save callLog", $scope.callLog);
                sfApi.addCallLog($scope.callLog.subject, $scope.callLog.whoId, $scope.callLog.whatId, $scope.callLog.note,  ($scope.call.incoming ? "inbound" : "outbound"), Math.round($scope.call.duration/1000), $scope.callLog.date,
                    function(response){
                        console.error(response);
                    });
            }
        }
    });

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

fjs.controllers.CallController.extends(fjs.controllers.CommonController);

fjs.controllers.CallController.CONFERENCE_CALL_TYPE = 0;
fjs.controllers.CallController.SYSTEM_CALL_TYPE = 7;
fjs.controllers.CallController.HOLD_CALL_TYPE = 3;
fjs.controllers.CallController.RING_CALL_TYPE = 0;
fjs.controllers.CallController.TALCKING_CALL_TYPE = 2;
fjs.controllers.CallController.OPENED_TRIANGLE = "&#9660;";
fjs.controllers.CallController.CLOSED_TRIANGLE = "&#9658;"
fjs.controllers.CallController.SORT_FIELD_NAME = "Name";
fjs.controllers.CallController.CALL_GET_INFO_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_DURATION_DELAY_IN_SEC = 1000;
fjs.controllers.CallController.CALL_LOG_CHANGE_DELAY_IN_SEC = 1000;