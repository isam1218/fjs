namespace("fjs.ui");
/**
 * @param $scope
 * @param {fjs.hud.DataManager} dataManager
 * @constructor
 * @extends fjs.ui.Controller
 */
fjs.ui.TestController = function($scope, dataManager){

    fjs.ui.Controller.call(this, $scope);
    /**
     * @type {fjs.hud.FeedModel}
     */
    var locationsModel = dataManager.getModel('locations');
    $scope.locations = locationsModel.order;
    $scope.setLocation = function(locationId) {
        //send action
    }
};
fjs.ui.TestController.extend(fjs.ui.Controller);
