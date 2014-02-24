/**
 * Created by vovchuk on 11/6/13.
 */
namespace("fjs.ui");

fjs.ui.LocationsController = function($scope, $element, dataManager) {
    fjs.ui.Controller.call(this, $scope);

    var locationsModel = dataManager.getModel("locations");
    var meModel = dataManager.getModel("me");
    $scope.locations = locationsModel.items;
    $scope.setLocation = function(locationId){
        dataManager.sendAction("locations", "select", {"a.locationId":meModel.itemsByKey["current_location"].propertyValue = locationId});
    };
    $scope.getCurrentLocationTitle = function() {
        var currentLocation;
        if(meModel.itemsByKey["current_location"] && (currentLocation = locationsModel.items[meModel.itemsByKey["current_location"].propertyValue])) {
            return currentLocation.name+" ("+currentLocation.phone+")";
        }
        else {
            return "Loading...";
        }
    };
    $scope.getCurrentLocationId = function() {
        return meModel.itemsByKey["current_location"] && meModel.itemsByKey["current_location"].propertyValue;
    }
};

fjs.ui.LocationsController.extend(fjs.ui.Controller);