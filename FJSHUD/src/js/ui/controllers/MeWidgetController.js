/**
 * Created by vovchuk on 11/6/13.
 */
namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.MeWidgetController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);

    var meModel = dataManager.getModel("me");
    var locationsModel = dataManager.getModel("locations");

    meModel.addListener("complete", $scope.$safeApply);
    locationsModel.addListener("complete", $scope.$safeApply);
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;
         if(meModel.itemsByKey["current_location"] && (currentLocation = locationsModel.items[meModel.itemsByKey["current_location"].propertyValue])) {
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    }
    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.setChatStatus = function(chatStatus){
        dataManager.sendAction("me", "setXmppStatus", {"a.xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"a.customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.setCustomStatus = function() {
        dataManager.sendAction("me", "setXmppStatus", {"a.xmppStatus":$scope.meData.chat_status.propertyValue ,"a.customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"LocationsPopup", x:100, y:200});
        return false;
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };

    $scope.$on("$destroy", function() {
        meModel.removeListener("complete", $scope.$safeApply);
        locationsModel.removeListener("complete", $scope.$safeApply);
    });
};

fjs.ui.MeWidgetController.extend(fjs.ui.Controller);