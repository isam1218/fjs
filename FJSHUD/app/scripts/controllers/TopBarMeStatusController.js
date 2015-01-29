hudweb.controller('TopBarMeStatusController', ['$scope', 'HttpService', function($scope, myHttpService) {
    var context = this;

	$scope.meData = {};
    $scope.menuIsOpen = false;
	
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
}]);