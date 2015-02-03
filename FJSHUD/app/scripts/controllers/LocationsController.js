hudweb.controller('LocationsController',['$scope','$element','HttpService',function($scope, $element,httpService) {
    //fjs.ui.Controller.call(this, $scope);

    //var locationsModel = dataManager.getModel("locations");
    //var meModel = dataManager.getModel("me");
    httpService.getFeed("me");
    httpService.getFeed("locations");
    $scope.locations = {};
    $scope.meModel = {};
    $scope.setLocation = function(locationId){
        httpService.sendAction("locations", "select", {"locationId":$scope.meModel["current_location"] = locationId});
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

        $scope.$apply();
    });

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid] = data[index];
            }
        }

        $scope.$apply();
    });

}]);
