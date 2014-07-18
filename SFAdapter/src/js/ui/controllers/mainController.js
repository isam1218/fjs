namespace("fjs.controllers");
fjs.controllers.MainController = function($scope, $element, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var context = this;
    var sfApiProvider = sfApi.getProvider();
    var browserWarningClosed = false;
    var _hasBrowserWarning = null;
    var timeSync = new fjs.utils.TimeSync();

    this.clientSettingsModel = dataManager.getModel(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL );
    this.clientSettingsModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, onClientSettingsPush);
    this.meModel = dataManager.getModel(fjs.model.MeModel.NAME);
    this.SOFTPHONE_WIDTH = 200;
    this.SOFTPHONE_HEIGHT = 200;
    this.FRAME_RESIZE_NAME = "resizeFrame";

    function onClientSettingsPush(entry) {
        if(context.clientSettingsModel.items[fjs.controllers.MainController.IS_WARNING_SHOWN]) {
            $scope.isWarningsShown = context.clientSettingsModel.items[fjs.controllers.MainController.IS_WARNING_SHOWN].value;
            context.safeApply($scope);
        }
    }

    $scope.isConnected = true;
    $scope.warningsTemplatePath = "templates/warnings.html";
    $scope.isWarningsShown = false;
    $scope.loggined = true;
    $scope.connection = true;
    $scope.phone = true;
    $scope.isLocationRegistered = true;
    $scope.fdpConfigured = true;
    $scope.fdpErrorMessage = "";
    $scope.dialogTemplate = null;
    $scope.dialogModel = null;

    var initResizeFrame = function() {
        var messageH = {};
        messageH.action = "setSoftphoneHeight";
        messageH.data = {};
        messageH.data.height = context.SOFTPHONE_HEIGHT;
        sfApiProvider.sendAction(messageH);

        var messageW = {};
        messageW.action = "setSoftphoneWidth";
        messageW.data = {};
        messageW.data.width = context.SOFTPHONE_WIDTH;
        sfApiProvider.sendAction(messageW);

        var frameHtml = document.getElementById(context.FRAME_RESIZE_NAME);
        var oldHeight = frameHtml.clientHeight;
        var timerResize = null;

        document.body.onresize = function(){
            onResize();
        };

        function onResize() {
            var browser = fjs.utils.Browser;
            if(frameHtml.clientHeight!=oldHeight && (browser.isIE() || browser.isSafari())) {
                $element[0].style.visibility = 'hidden';
            }
            if(timerResize!=null) {
                clearTimeout(timerResize);
                timerResize = null;
            }
            timerResize=setTimeout( function(){
                var height = frameHtml.clientHeight;
                if(height!=oldHeight) {
                    var message = {};
                    message.action = "setSoftphoneHeight";
                    message.data = {};
                    message.data.height = frameHtml.clientHeight;
                    message.callback = function(res){
                        timerResize = null;
                    };
                    sfApiProvider.sendAction(message);
                }
                if(browser.isIE() || browser.isSafari()) {
                    $element[0].style.visibility = 'visible';
                }
                oldHeight = height;
            }, 100);
        }
        setTimeout(function(){
            frame.onresize = function(){
                onResize();
            }
        },200);
    };

    initResizeFrame();

    $scope.showBrowserWarning = function() {
        if(_hasBrowserWarning===null) {
            var isDB = true;
            if(fjs.utils.Browser.isSafari()) {
                try {
                    window.openDatabase('test', '', 'test', 1024);
                }
                catch(e) {
                    isDB = false;
                }
            }
            _hasBrowserWarning = !fjs.utils.Cookies.check() || !fjs.utils.LocalStorage.check() || !isDB;
        }
        return _hasBrowserWarning && !browserWarningClosed;
    };

    $scope.getBrowserWarningLink = function() {
        return 'http://www.fonality.com/crmlink/' + fjs.utils.Browser.getBrowserName();
    };

    $scope.getBrowserWarningMessage = function() {
        return 'Click here for ' + fjs.utils.Browser.getBrowserName() + ' instructions.';
    };

    $scope.closeBrowserWarning = function() {
        browserWarningClosed = true;
    };

    $scope.showWarnings = function() {
        $scope.isWarningsShown = true;
        context.safeApply($scope);
        dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
    };

    $scope.showLoadingPanel = function() {
        return !$scope.name && !$scope.isWarningsShown && $scope.loggined && $scope.connection && $scope.fdpConfigured;
    };

    $scope.hideWarnings = function() {
        $scope.isWarningsShown = false;
        context.safeApply($scope);
        dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
    };

    $scope.toggleWarnings = function() {
        if($scope.isWarningsShown) {
            $scope.hideWarnings();
        }
        else {
            $scope.showWarnings();
        }
    };

    var checkShowWarning = function() {
        $scope.isWarningsButtonShown = !$scope.loggined || !$scope.connection || ! $scope.isLocationRegistered || !$scope.fdpConfigured;
        if($scope.loggined && $scope.connection && $scope.isLocationRegistered && $scope.fdpConfigured) {
            $scope.isWarningsShown = false;
            dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
        }
        context.safeApply($scope);
    };

    this.meListener = function(entry){
        var name = context.meModel.getProperty("display_name");
        $scope.name = name ? ("User: " + name) : "";
        var ext = context.meModel.getProperty("primary_extension");
        $scope.extension = ext ? ("Extension: x" + ext) : "";
        context.safeApply($scope);
    };

    this.authorizationWarningListener = function(data) {
        if(data.eventType == fjs.model.DataManager.EV_TICKET) {
            $scope.loggined = true;
            $scope.authErrorMessage = "";
        }
        else if(data.eventType == fjs.model.DataManager.EV_AUTH_ERROR) {
            $scope.loggined = false;
            $scope.authErrorMessage = data.message;
        }
        checkShowWarning();
        $scope.isConnected = ($scope.connection && $scope.loggined);
        context.safeApply($scope);
    };

    this.connectionWarningListener = function(data) {

        // Add timeout, task #36371 SFA: Warning icon shows up every time I click on anything on Salesforce
        setTimeout(function() {
            if(data.eventType == fjs.model.DataManager.EV_FDP_CONFIG_ERROR) {
                $scope.fdpConfigured = false;
                $scope.fdpErrorMessage = data.message;
            }
            else if(data.eventType == fjs.model.DataManager.EV_FDP_CONFIG) {
                $scope.fdpConfigured = true;
                $scope.fdpErrorMessage = data.message;
            }

            if(data.eventType == fjs.model.DataManager.EV_CONNECTION_ESTABLISHED || data.eventType == fjs.model.DataManager.EV_NETWORK_PROBLEM) {
                $scope.connection = data.connected;
                $scope.isConnected = ($scope.connection && $scope.loggined);
                if($scope.fdpConfigured) {
                    $scope.fdpErrorMessage = data.message;
                }
            }
            checkShowWarning();
            context.safeApply($scope);
        }, 1000);
    };

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });

    $scope.showSaveCallLogDialog = function(call) {
        if(call.mycallsclient_callLog.related.length>0) {
            $scope.dialogTemplate = "templates/saveCallLogDialog.html";
            $scope.dialogModel = call;
            context.safeApply($scope);
        }
        else {
            $scope.saveCallLog(call);
        }
    };

    $scope.closeDialog = function() {
        $scope.dialogTemplate = null;
        $scope.dialogModel = null;
    };

    $scope.saveCallLog = function(call) {
        if(call && call.mycallsclient_callLog) {
            var message = {};
            message.action = "addCallLog";
            message.data = {};
            message.data.subject = call.mycallsclient_callLog.subject;
            message.data.whoId = call.mycallsclient_callLog.whoId;
            message.data.whatId = call.mycallsclient_callLog.whatId;
            message.data.note = call.mycallsclient_callLog.note;
            message.data.callType = (call.incoming ? "inbound" : "outbound");
            message.data.duration = Math.round((new Date().getTime() - (call.created + timeSync.getDefault())) / 1000);
            message.data.date = call.mycallsclient_callLog.date;
            message.callback = function (response) {
                fjs.utils.Console.error(response);
            };
            sfApiProvider.sendAction(message);
        }
    };

    $scope.$on("$destroy", function() {
        context.meModel.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.meListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.AUTHORIZATION_LISTENER, context.authorizationWarningListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.CONNECTION_LISTENER, context.connectionWarningListener);
    });

    this.meModel.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.meListener);

    dataManager.addWarningListener(fjs.controllers.MainController.AUTHORIZATION_LISTENER, this.authorizationWarningListener);
    dataManager.addWarningListener(fjs.controllers.MainController.CONNECTION_LISTENER, this.connectionWarningListener);

    checkShowWarning();
};

fjs.controllers.MainController.CONNECTION_LISTENER = "Connection";
fjs.controllers.MainController.AUTHORIZATION_LISTENER = "Authorization";
fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL = "clientsettings";
fjs.controllers.MainController.IS_WARNING_SHOWN = "isWarningsShown";

fjs.controllers.MainController.extend(fjs.controllers.CommonController);