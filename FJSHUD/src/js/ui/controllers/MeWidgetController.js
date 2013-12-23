/**
 * Created by vovchuk on 11/6/13.
 */
namespace("fjs.ui");

fjs.ui.MeWidgetController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);

    var dataProvider = new fjs.fdp.FDPDataProvider();
    var meModel = dataProvider.getModel("me");
    var locationsModel = dataProvider.getModel("locations");

    meModel.addListener("complete", $scope.$safeApply);
    locationsModel.addListener("complete", $scope.$safeApply);
    $scope.getCurrentLocationTitle = function() {
         var currentLocation
         if(meModel.itemsByKey.current_location && (currentLocation = locationsModel.items[meModel.itemsByKey.current_location.propertyValue])) {
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    }
    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.setChatStatus = function(chatStatus){
        dataProvider.sendAction("me", "setXmppStatus", {"a.xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"a.customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.setCustomStatus = function() {
        dataProvider.sendAction("me", "setXmppStatus", {"a.xmppStatus":$scope.meData.chat_status.propertyValue ,"a.customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"LocationsPopup", x:100, y:200});
        return false;
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };

    $scope.unpin = function() {
        dataProvider.runApp();
    };

    $scope.$on("$destroy", function() {
        meModel.removeListener("complete", $scope.$safeApply);
        locationsModel.removeListener("complete", $scope.$safeApply);
    });
};

fjs.ui.MeWidgetController.extends(fjs.ui.ControllerBase);