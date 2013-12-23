/**
 * Created by vovchuk on 11/6/13.
 */
namespace("fjs.ui");

fjs.ui.LocationsController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var locationsModel = dataProvider.getModel("locations");
    var meModel = dataProvider.getModel("me");
    $scope.locations = locationsModel.items;
    $scope.setLocation = function(locationId){
        dataProvider.sendAction("locations", "select", {"a.locationId":meModel.itemsByKey.current_location.propertyValue = locationId});
    };
    $scope.getCurrentLocationTitle = function() {
        var currentLocation;
        if(meModel.itemsByKey.current_location && (currentLocation = locationsModel.items[meModel.itemsByKey.current_location.propertyValue])) {
            return currentLocation.name+" ("+currentLocation.phone+")";
        }
        else {
            return "Loading...";
        }
    }
    $scope.getCurrentLocationId = function() {
        return meModel.itemsByKey.current_location && meModel.itemsByKey.current_location.propertyValue;
    }
};

fjs.ui.LocationsController.extends(fjs.ui.ControllerBase);