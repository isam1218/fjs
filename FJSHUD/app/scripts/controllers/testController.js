fjs.core.namespace("fjs.ui");
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
    $scope.locations = locationsModel.items;
    $scope.setLocation = function(locationId) {
        //send action
    }
};
fjs.core.inherits(fjs.ui.TestController, fjs.ui.Controller);
