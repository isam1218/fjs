hudweb.controller('LocationsController',['$scope', '$rootScope', '$routeParams', '$element', 'HttpService', 'SettingsService', 'PhoneService', function($scope, $rootScope, $routeParams, $element, httpService, settingsService, phoneService) {
    var call = phoneService.getCallDetail($routeParams.callId);
    $scope.locations = {};
	
	// get locations
	phoneService.getLocationPromise().then(function(data) {
		$scope.locations = data;
	});
	
	// show another device error
	if (settingsService.getSetting('instanceId') != localStorage.instance_id) {
		$rootScope.$broadcast('another_device', true);
	}
    
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

}]);
