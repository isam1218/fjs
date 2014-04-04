namespace("fjs.controllers");
fjs.controllers.MainController = function($scope) {
    fjs.controllers.CommonController(this);
    var contsxt = this;
    var me = SFApp.feedModels[fjs.app.SFAdapter.ME_FEED_NAME];
    var keyToXpid = {};

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
    var context = this;

    me.addListener(fjs.controllers.WarningsController.PUSH_LISTENER, function(data){
        if(data.eventType==fjs.controllers.WarningsController.PUSH_LISTENER) {
            keyToXpid[data.entry.propertyKey] = data.entry.propertyValue;
        }
    });

    me.addListener(fjs.controllers.WarningsController.DELETE_LISTENER, function(data){
        if(data.eventType==fjs.controllers.WarningsController.DELETE_LISTENER) {
            delete  keyToXpid[data.propertyKey];
        }
    });

    me.addListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
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

    SFApp.syncManager.addEventListener("Authorization", function(data) {
        $scope.loggined = data;
        checkShowWarning();
        context.safeApply($scope);
    });

    SFApp.syncManager.addEventListener("Connection", function(data) {
        // Add timeout, task #36371 SFA: Warning icon shows up every time I click on anything on Salesforce
        setTimeout(function() {
            $scope.connection = data;
            checkShowWarning();
        }, 1000);
        context.safeApply($scope);
    });

    $scope.$on('onLocationStatus', function(event, key) {
        $scope.isLocationRegistered = key;
        checkShowWarning();
        context.safeApply($scope);
    });
};

fjs.controllers.MainController.extends(fjs.controllers.CommonController);
