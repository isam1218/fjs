hudweb.controller('LocationsController',['$scope', '$routeParams', '$element','HttpService',function($scope, $routeParams, $element,httpService) {
    //fjs.ui.Controller.call(this, $scope);

    /*
    when loading controller get the necessary feeds 
    */
    //httpService.getFeed("me");
    httpService.getFeed("locations");
    httpService.getFeed("location_status");
    $scope.locations = {};
    $scope.meModel = {};
    $scope.setLocation = function(locationId){
        httpService.sendAction("locations", "select", {"locationId":$scope.meModel["current_location"] = locationId});
        $scope.onBodyClick();
    };
    
    $scope.moveLocation = function(locationId){
    	var callId = $routeParams.callId;
        httpService.sendAction("mycalls", "route", {"mycallId":callId, "toLocationId":$scope.meModel["current_location"] = locationId, "variance": "native", "options": "0"});
        $scope.onBodyClick();
    };
    
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;

        if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {
        	currentLocation = $scope.locations[$scope.meModel["current_location"]];
             
             if(currentLocation.locationType != 'a' && currentLocation.locationType != 'w')
            	 return currentLocation.shortName+" ("+ currentLocation.phone+")";
             else
            	 return currentLocation.shortName;
         }
         else {
             return "Loading...";
         }
    };


    $scope.getCurrentLocationId = function() {
        return $scope.meModel["current_location"] && $scope.meModel["current_location"];
    }

   
    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0; i < data.length; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });

     $scope.$on('location_status_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0; i < data.length; i++) {
                $scope.locations[data[i].xpid].status = data[i];
            }
        }

    });

}]);
