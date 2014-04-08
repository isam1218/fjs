namespace("fjs.controllers");
fjs.controllers.MainController = function($scope, dataManager, sfApi) {
    fjs.controllers.CommonController(this);
    var context = this;
    var me = dataManager.getModel('me');
    var keyToXpid = {};

    this.sfApi = sfApi;

    this.SOFTPHONE_WIDTH = 200;
    this.SOFTPHONE_HEIGHT = 200;
    this.FRAME_RESIZE_NAME = "resizeFrame";

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

    me.addEventListener(fjs.controllers.WarningsController.PUSH_LISTENER, function(data){
        if(data.eventType==fjs.controllers.WarningsController.PUSH_LISTENER) {
            keyToXpid[data.entry.propertyKey] = data.entry.propertyValue;
        }
    });

    me.addEventListener(fjs.controllers.WarningsController.DELETE_LISTENER, function(data){
        if(data.eventType==fjs.controllers.WarningsController.DELETE_LISTENER) {
            delete  keyToXpid[data.propertyKey];
        }
    });

    me.addEventListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        $scope.name = "User: " + keyToXpid["display_name"];
        $scope.extension = "Extension: x" + keyToXpid["primary_extension"];
        context.safeApply($scope);
    });

    var checkShowWarning = function() {
        $scope.isWarningsButtonShown = !$scope.loggined || !$scope.connection || ! $scope.isLocationRegistered;
        if($scope.loggined && $scope.connection && $scope.isLocationRegistered) {
            $scope.isWarningsShown = false;
        }
    };

    checkShowWarning();

//    SFApp.syncManager.addEventListener("Authorization", function(data) {
//        $scope.loggined = data;
//        checkShowWarning();
//        context.safeApply($scope);
//    });
//
//    SFApp.syncManager.addEventListener("Connection", function(data) {
//        // Add timeout, task #36371 SFA: Warning icon shows up every time I click on anything on Salesforce
//        setTimeout(function() {
//            $scope.connection = data;
//            checkShowWarning();
//        }, 1000);
//        context.safeApply($scope);
//    });

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });
};

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