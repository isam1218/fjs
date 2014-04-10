namespace("fjs.controllers");
fjs.controllers.WarningsController = function($scope, $element, dataManager) {
    fjs.controllers.CommonController(this);
    this.me = dataManager.getModel('me');
    this.locations = dataManager.getModel('locations');
    var keyToXpid = {};
    var context = this;

    this.deleteMeListener = function(data){
        delete keyToXpid[data.propertyKey];
    };

    this.pushMeListener = function(data){
        keyToXpid[data.propertyKey] = data.propertyValue;
    };

    this.completeMeListener = function(){
        $scope.name = keyToXpid["display_name"];
        $scope.fdp_version = keyToXpid["fdp_version"];
        $scope.my_jid = keyToXpid["my_jid"];
        $scope.license = keyToXpid["license"];
        $scope.extension = keyToXpid["primary_extension"];
        $scope.locationId =  keyToXpid["current_location"];
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            $scope.location =  context.locations.items[$scope.locationId].shortName;
        }
        var location = context.locations.items[$scope.locationId];
        if(location){
            setLocationStatus(location);
        }
        context.safeApply($scope);
    };

    this.locationListener = function(){
        if(context.locations.items && context.locations.items[$scope.locationId]) {
            $scope.location =  context.locations.items[$scope.locationId].shortName;
            setLocationStatus(location);
            context.safeApply($scope);
        }
    };

    this.me.addEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, this.completeMeListener);
    this.me.addEventListener(fjs.controllers.CommonController.PUSH_LISTENER, this.pushMeListener);
    this.me.addEventListener(fjs.controllers.CommonController.DELETE_LISTENER, this.deleteMeListener);
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
        dataManager.sendAction('me', "feedback", data);
        $scope.close();
    };

    $scope.close = function() {
        $scope.showWarnings();
    };

    $scope.$on("$destroy", function() {
        context.me.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.completeMeListener);
        context.me.removeEventListener(fjs.controllers.CommonController.PUSH_LISTENER, context.pushMeListener);
        context.me.removeEventListener(fjs.controllers.CommonController.DELETE_LISTENER, context.deleteMeListener);
        context.locations.removeEventListener(fjs.controllers.CommonController.COMPLETE_LISTENER, context.locationListener);
    });
};

fjs.controllers.WarningsController.extend(fjs.controllers.CommonController);

fjs.controllers.WarningsController.REGISTERED = "Registered";
fjs.controllers.WarningsController.UNREGISTERED = "Unregistered";

fjs.controllers.WarningsController.CARRIER_TYPE = "m";
fjs.controllers.WarningsController.ON_LOCATION_STATUS = "onLocationStatus";


