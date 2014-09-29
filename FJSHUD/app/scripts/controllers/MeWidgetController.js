/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.MeWidgetController = function($scope, dataManager) {
    var context = this;

    fjs.ui.Controller.call(this, $scope);

    var meModel = dataManager.getModel("me");
    var locationsModel = dataManager.getModel("locations");

    meModel.addEventListener("complete", $scope.$safeApply);
    locationsModel.addEventListener("complete", $scope.$safeApply);
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
    };
    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.setChatStatus = function(chatStatus){
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.setCustomStatus = function() {
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue ,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y});
        return false;
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };

    $scope.$on("$destroy", function() {
        meModel.removeEventListener("complete", $scope.$safeApply);
        locationsModel.removeEventListener("complete", $scope.$safeApply);
    });
    $scope.somechild = "views/testTemplate.html";
};

fjs.core.inherits(fjs.ui.MeWidgetController, fjs.ui.Controller)