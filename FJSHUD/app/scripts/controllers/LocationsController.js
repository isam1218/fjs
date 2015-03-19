hudweb.controller('LocationsController',['$scope','$element','HttpService',function($scope, $element,httpService) {
    //fjs.ui.Controller.call(this, $scope);

    /*
    when loading controller get the necessary feeds 
    */
    httpService.getFeed("me");
    httpService.getFeed("locations");
    httpService.getFeed("location_status");
    $scope.locations = {};
    $scope.meModel = {};
    $scope.setLocation = function(locationId){
        httpService.sendAction("locations", "select", {"locationId":$scope.meModel["current_location"] = locationId});
        $scope.onBodyClick();
    };
    
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;


         if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {
             currentLocation = $scope.locations[$scope.meModel["current_location"]];
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    };


    $scope.getCurrentLocationId = function() {
        return $scope.meModel["current_location"] && $scope.meModel["current_location"];
    }

    $scope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }

    });

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid] = data[index];
            }
        }

    });

     $scope.$on('location_status_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid].status = data[index];
            }
        }

    });

}]);
