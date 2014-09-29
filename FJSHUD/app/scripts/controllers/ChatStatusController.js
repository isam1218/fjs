/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.ChatStatusController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var meModel = dataManager.getModel("me");
    meModel.addEventListener("complete", $scope.$safeApply);
    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.chatStatuses2 ={"available":"Available", "away":"Away", "dnd":"Busy"};
    $scope.getCurrentChatStatus = function() {
        if($scope.meData.chat_status) {
            return $scope.chatStatuses2[$scope.meData.chat_status.propertyValue];
        }
        return 'Offline';
    };
    $scope.setChatStatus = function(chatStatus){
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.$on("$destroy", function() {
        meModel.removeEventListener("complete", $scope.$safeApply);
    });
};

fjs.core.inherits(fjs.ui.ChatStatusController, fjs.ui.Controller);