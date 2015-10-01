hudweb.controller('LocationsController',['$scope', '$routeParams', '$element','HttpService','PhoneService',function($scope, $routeParams, $element,httpService,phoneService) {
    //fjs.ui.Controller.call(this, $scope);

    /*
    when loading controller get the necessary feeds 
    */
    httpService.getFeed("locations");
    httpService.getFeed("location_status");
    var call = phoneService.getCallDetail($routeParams.callId);
    $scope.locations = {};
    $scope.setLocation = function(locationId){
        httpService.sendAction("locations", "select", {"locationId":$scope.meModel["current_location"] = locationId});
        $scope.onBodyClick();
    };
    
    $scope.moveLocation = function(locationId){
    	var callId = $routeParams.callId;
        httpService.sendAction("mycalls", "route", {"mycallId":callId, "toLocationId":locationId, "variance": "native", "options": "0"});
        $scope.onBodyClick();
    };
    
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;

        if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {
        	currentLocation = $scope.locations[$scope.meModel["current_location"]];
             
             if(currentLocation.locationType != 'a' && currentLocation.locationType != 'w' && currentLocation.locationType != 'm')
            	 return currentLocation.shortName+" ("+ currentLocation.phone+")";
             else
            	 return currentLocation.shortName;
         }
         else {
             return "Loading...";
         }
    };


    $scope.getCurrentLocationId = function() {
        if(call && $scope.currentPopup.model.callTransfer){
            return call.locationId;
        }else{
            return $scope.meModel["current_location"] && $scope.meModel["current_location"];
        }
    };

   
    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                if(data[i].locationType != 'a'){
                     $scope.locations[data[i].xpid] = data[i];
                }
            }
        }
    });

     $scope.$on('location_status_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                if($scope.locations[data[i].xpid]){
                    $scope.locations[data[i].xpid].status = data[i];
                    if($scope.locations[data[i].xpid].locationType == 'w'){
                        var state = phoneService.getPhoneState();
                        $scope.locations[data[i].xpid].status.deviceStatus = state ? 'r' : 'u';
                    }
                }
            }
        }

    });

}]);
