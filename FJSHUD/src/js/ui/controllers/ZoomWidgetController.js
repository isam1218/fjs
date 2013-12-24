namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.ZoomWidgetController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);

    //var meModel = dataManager.getModel("me");

    //meModel.addListener("complete", $scope.$safeApply);
    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
   // $scope.meData = meModel.itemsByKey;
    $scope.joinConference = function(conferenceId){
        window.open("https://api.zoom.us/j/" + conferenceId);
    };

};

fjs.ui.ZoomWidgetController.extend(fjs.ui.Controller);