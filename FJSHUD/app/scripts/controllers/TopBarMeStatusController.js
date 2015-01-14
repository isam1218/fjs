/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.TopBarMeStatusController = function($scope, dataManager, myHttpService) {
    var context = this;

    fjs.ui.Controller.call(this, $scope);

    var meModel = dataManager.getModel("me");
    var locationsModel = dataManager.getModel("locations");
    $scope.menuIsOpen = false;

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
            return "";
        }
    };
    $scope.toogleMenu = function() {
        $scope.menuIsOpen = !$scope.menuIsOpen;
    }
    $scope.getCurrentChatStatus = function() {
        if($scope.meData.chat_status) {
            return $scope.chatStatuses[$scope.meData.chat_status.propertyValue];
        }
        return 'Offline';
    };

    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y});
        return false;
    };

    $scope.showChatStatusPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.showPopup({key:"ChatStatusesPopup", x:offset.x-60, y:offset.y});
        return false;
    };

    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
    $scope.meData = meModel.itemsByKey;

    $scope.chatStatuses = {"available":"Available", "away":"Away", "dnd":"Busy"};

    $scope.setChatStatus = function(chatStatus) {
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };
    $scope.logout = function($event) {
        $event.preventDefault();
        myHttpService.logout();
        return false;
    };

    $scope.$on("$destroy", function() {
        meModel.removeEventListener("complete", $scope.$safeApply);
        locationsModel.removeEventListener("complete", $scope.$safeApply);
    });
};

fjs.core.inherits(fjs.ui.TopBarMeStatusController, fjs.ui.Controller);