namespace("fjs.controllers");
fjs.controllers.MainController = function($scope, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var context = this;
    var sfApiProvider = sfApi.getProvider();

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

    var initResizeFrame = function() {
        var messageH = {};
        messageH.action = "setSoftphoneHeight";
        messageH.data = {};
        messageH.data.height = context.SOFTPHONE_HEIGHT;
        sfApiProvider.sendAction(messageH);

        var messageW = {};
        messageW.action = "setSoftphoneWidth";
        messageW.data = {};
        messageW.data.height = context.SOFTPHONE_WIDTH;
        sfApiProvider.sendAction(messageW);

        var frameHtml = document.getElementById(context.FRAME_RESIZE_NAME);
        var oldHeight = frameHtml.clientHeight;
        var timerResize = null;

        document.body.onresize = function(){
            onResize();
        };

        function onResize() {
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

    $scope.showWarnings = function() {
        $scope.isWarningsShown = true;
        context.safeApply($scope);
        dataManager.sendAction(fjs.controllers.MainController.CLIENT_SETTINGS_FEED_MODEL , "push", {"xpid": fjs.controllers.MainController.IS_WARNING_SHOWN, "value":  $scope.isWarningsShown});
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
        $scope.isWarningsButtonShown = !$scope.loggined || !$scope.connection || ! $scope.isLocationRegistered;
        if($scope.loggined && $scope.connection && $scope.isLocationRegistered) {
            $scope.isWarningsShown = false;
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
        $scope.loggined = data;
        checkShowWarning();
        $scope.isConnected = ($scope.connection && $scope.loggined);
        context.safeApply($scope);
    };

    this.connectionWarningListener = function(data) {
        // Add timeout, task #36371 SFA: Warning icon shows up every time I click on anything on Salesforce
        setTimeout(function() {
            $scope.connection = data;
            checkShowWarning();
            $scope.isConnected = ($scope.connection && $scope.loggined);
            context.safeApply($scope);
        }, 1000);
    };

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });

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