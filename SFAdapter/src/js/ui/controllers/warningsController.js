namespace("fjs.controllers");
fjs.controllers.WarningsController = function($scope, $element, dataManager) {
    fjs.controllers.CommonController(this);
    this.me = dataManager.getModel(fjs.model.MeModel.NAME);
    this.locations = dataManager.getModel('locations');
    var context = this;

    this.completeMeListener = function(){
        $scope.name = context.me.getProperty("display_name");
        $scope.fdp_version = context.me.getProperty("fdp_version");
        $scope.my_jid = context.me.getProperty("my_jid");
        $scope.extension = context.me.getProperty("primary_extension");
        $scope.locationId = context.me.getProperty("current_location");
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            $scope.location =  context.locations.items[$scope.locationId].shortName;
            var location = context.locations.items[$scope.locationId];
            if(location){
                setLocationStatus(location);
            }
        }
        context.safeApply($scope);
    };

    this.locationListener = function(){
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            var loc = context.locations.items[$scope.locationId];
            $scope.location = loc.shortName;
            setLocationStatus(loc);
            context.safeApply($scope);
        }
    };

    this.me.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeMeListener);
    this.locations.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.locationListener);

    var setLocationStatus =  function(location) {
        if(location && location.locationType == fjs.controllers.WarningsController.CARRIER_TYPE) {
            $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
            $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
        }
        else {
            if(location.location_status_deviceStatus == "r") {
                $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
            }
            else {
                $scope.locationState = fjs.controllers.WarningsController.UNREGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, false);
            }
        }
    };

    $scope.sendFeedback = function(msg) {
        var description = "";
        description += "Jid: " + $scope.my_jid;
        description += "; Name: " + $scope.name;
        description += "; Extension: " + $scope.extension;
        description += "; License: " + $scope.license;
        description += "; FDP version: " + $scope.fdp_version;
        if($scope.msg && $scope.msg.length != 0) {
            description += "; Message: " + $scope.msg + ".";
        }
        else {
            description += ";"
        }

        var data = {};
        data["description"] = description;
        data["date"] = (new Date()).getTime();
        data["email"] = "";
        data["taskId"] = "-1_-1";
        dataManager.sendAction(fjs.model.MeModel.NAME, "feedback", data);
        $scope.close();
    };

    $scope.close = function() {
        $scope.hideWarnings();
    };

    $scope.$on("$destroy", function() {
        context.me.removeEventListener(fjs.controllers.CommonController.PUSH_LISTENER, context.completeMeListener);
        context.locations.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.locationListener);
    });
};

fjs.controllers.WarningsController.extend(fjs.controllers.CommonController);

fjs.controllers.WarningsController.REGISTERED = "Registered";
fjs.controllers.WarningsController.UNREGISTERED = "Unregistered";

fjs.controllers.WarningsController.CARRIER_TYPE = "m";
fjs.controllers.WarningsController.ON_LOCATION_STATUS = "onLocationStatus";
