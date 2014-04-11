namespace("fjs.controllers");
fjs.controllers.MainController = function($scope, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var context = this;
    /**
     * @type {fjs.model.MeModel}
     */
    var me = dataManager.getModel(fjs.model.MeModel.NAME);

    this.sfApi = sfApi;

    this.SOFTPHONE_WIDTH = 200;
    this.SOFTPHONE_HEIGHT = 200;
    this.FRAME_RESIZE_NAME = "resizeFrame";

    $scope.isConnected = true;

    this.initResizeFrame();

    $scope.warningsTemplatePath = "templates/warnings.html";

    $scope.showWarnings = function() {
        $scope.isWarningsShown = !$scope.isWarningsShown;
    };
    $scope.hideWarningButton = function() {
        $scope.isWarningsButtonShown = false;
        context.safeApply($scope);
    };

    $scope.isWarningsShown = false;
    $scope.loggined = true;
    $scope.connection = true;
    $scope.phone = true;
    $scope.isLocationRegistered = true;

    var checkShowWarning = function() {
        $scope.isWarningsButtonShown = !$scope.loggined || !$scope.connection || ! $scope.isLocationRegistered;
        if($scope.loggined && $scope.connection && $scope.isLocationRegistered) {
            $scope.isWarningsShown = false;
        }
    };

    //Listeners
    this.completeMeListener = function(){
        $scope.name = "User: " + me.getProperty("display_name");
        $scope.extension = "Extension: x" + me.getProperty("primary_extension");
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

    me.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeMeListener);

    dataManager.addWarningListener(fjs.controllers.MainController.AUTHORIZATION_LISTENER, this.authorizationWarningListener);
    dataManager.addWarningListener(fjs.controllers.MainController.CONNECTION_LISTENER, this.connectionWarningListener);

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });

    $scope.$on("$destroy", function() {
        context.me.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.completeMeListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.AUTHORIZATION_LISTENER, context.authorizationWarningListener);
        dataManager.removeWarningListener(fjs.controllers.CommonController.CONNECTION_LISTENER, context.connectionWarningListener);
    });

    checkShowWarning();
};

fjs.controllers.MainController.CONNECTION_LISTENER = "Connection";
fjs.controllers.MainController.AUTHORIZATION_LISTENER = "Authorization";

fjs.controllers.MainController.extend(fjs.controllers.CommonController);

fjs.controllers.MainController.prototype.initResizeFrame = function() {
    var context = this;

    this.sfApi.setSoftphoneHeight(this.SOFTPHONE_HEIGHT, function(res) {
    });
    this.sfApi.setSoftphoneWidth(this.SOFTPHONE_WIDTH, function(res) {
    });

    var frameHtml = document.getElementById(this.FRAME_RESIZE_NAME);
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
                context.sfApi.setSoftphoneHeight(frameHtml.clientHeight, function(res){
                    timerResize = null;
                });
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