namespace("fjs.controllers");
fjs.controllers.WarningsController = function($scope, $element, dataManager) {
    fjs.controllers.CommonController(this);
    var me = dataManager.getModel('me');
    var locations = dataManager.getModel('locations');
    var keyToXpid = {};
    var context = this;

    me.addEventListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        $scope.name = keyToXpid["display_name"];
        $scope.fdp_version = keyToXpid["fdp_version"];
        $scope.my_jid = keyToXpid["my_jid"];
        $scope.license = keyToXpid["license"];
        $scope.extension = keyToXpid["primary_extension"];
        $scope.locationId =  keyToXpid["current_location"];
        if(locations.items && locations.items[$scope.locationId]) {
            $scope.location =  locations.items[$scope.locationId].shortName;
        }
        var location = locations.items[$scope.locationId];
        if(location){
            setLocationStatus(location);
        }
        context.safeApply($scope);
    });

    locations.addEventListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        if(locations.items && locations.items[$scope.locationId]) {
            $scope.location =  locations.items[$scope.locationId].shortName;
            setLocationStatus(location);
           context.safeApply($scope);
        }
    });

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

    me.addEventListener(fjs.controllers.WarningsController.PUSH_LISTENER, function(data){
         keyToXpid[data.propertyKey] = data.propertyValue;
    });

    me.addEventListener(fjs.controllers.WarningsController.DELETE_LISTENER, function(data){
         delete keyToXpid[data.propertyKey];
    });

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
};

fjs.controllers.WarningsController.extend(fjs.controllers.CommonController);

fjs.controllers.WarningsController.REGISTERED = "Registered";
fjs.controllers.WarningsController.UNREGISTERED = "Unregistered";
fjs.controllers.WarningsController.CARRIER_TYPE = "m";
fjs.controllers.WarningsController.ON_LOCATION_STATUS = "onLocationStatus";

fjs.controllers.WarningsController.COMPLETE_LISTENER = "complete";
fjs.controllers.WarningsController.PUSH_LISTENER = "push";
fjs.controllers.WarningsController.DELETE_LISTENER = "delete";

