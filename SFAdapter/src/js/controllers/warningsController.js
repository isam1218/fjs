namespace("fjs.controllers");
fjs.controllers.WarningsController = function($scope, $element) {
    fjs.controllers.CommonController(this);
    var me = SFApp.feedModels[fjs.app.SFAdapter.ME_FEED_NAME];
    var locations = SFApp.feedModels[fjs.app.SFAdapter.LOCATIONS_FEED_NAME];
    var locationStatus = SFApp.feedModels[fjs.app.SFAdapter.LOCATION_STATUS_FEED_NAME];
    var keyToXpid = {};
    var context = this;

    me.addListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        $scope.name = keyToXpid["display_name"];
        $scope.fdp_version = keyToXpid["fdp_version"];
        $scope.my_jid = keyToXpid["my_jid"];
        $scope.license = keyToXpid["license"];
        $scope.extension = keyToXpid["primary_extension"];
        $scope.locationId =  keyToXpid["current_location"];
        if(locations.items && locations.items[$scope.locationId]) {
            $scope.location =  locations.items[$scope.locationId].shortName;
        }
        if(locationStatus.items) {
            var locStatus = locationStatus.items[$scope.locationId];
            if(locStatus) {
                setLocationStatus(locStatus, locations.items[$scope.locationId]);
            }
        }
        context.safeApply($scope);
    });

    locations.addListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        if(locations.items && locations.items[$scope.locationId]) {
            $scope.location =  locations.items[$scope.locationId].shortName;
            context.safeApply($scope);
        }
    });

    locationStatus.addListener(fjs.controllers.WarningsController.COMPLETE_LISTENER, function(){
        if(locationStatus && locationStatus.items) {
            var locStatus = locationStatus.items[$scope.locationId];
            var location = locations.items[$scope.locationId];
            if(locStatus) {
                setLocationStatus(locStatus, location);
                context.safeApply($scope);
            }
        }
    });

    var setLocationStatus =  function(locStatus, location) {
        var currentDeviceAutoAnsver = locStatus.autoAnswer;
        if(location && location.locationType == fjs.controllers.WarningsController.CARRIER_TYPE) {
            $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
            $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
        }
        else {
            if(locStatus.deviceStatus == "r") {
                $scope.locationState = fjs.controllers.WarningsController.REGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, true);
            }
            else {
                $scope.locationState = fjs.controllers.WarningsController.UNREGISTERED;
                $scope.$emit(fjs.controllers.WarningsController.ON_LOCATION_STATUS, false);
            }
        }
    };

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
        data["a.description"] = description;
        data["a.date"] = (new Date()).getTime();
        data["a.email"] = "";
        data["a.type"] = "salesforce";
        data["a.taskId"] = "-1_-1";
        var fdp = fjs.fdp.SyncManager();
        fdp.sendAction(fjs.app.SFAdapter.ME_FEED_NAME, "feedback", data);
        $scope.close();
    };

    $scope.close = function() {
        $scope.showWarnings();
    };
};

fjs.controllers.WarningsController.extends(fjs.controllers.CommonController);

fjs.controllers.WarningsController.REGISTERED = "Registered";
fjs.controllers.WarningsController.UNREGISTERED = "Unregistered";
fjs.controllers.WarningsController.CARRIER_TYPE = "m";
fjs.controllers.WarningsController.ON_LOCATION_STATUS = "onLocationStatus";

fjs.controllers.WarningsController.COMPLETE_LISTENER = "complete";
fjs.controllers.WarningsController.PUSH_LISTENER = "push";
fjs.controllers.WarningsController.DELETE_LISTENER = "delete";

