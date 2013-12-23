namespace("fjs.ui");

fjs.ui.TopNavigationController = function($scope, dataManager) {

    fjs.ui.Controller.call(this, $scope);
    var meModel = dataManager.getModel("me");
    meModel.addListener("complete", $scope.$safeApply);
    $scope.getMeAvatarUrl = function(){
        return ;//meModel.getMyAvatarUrl(38, 38);
    };

    $scope.appIcons = [
        {title:"Conferencing", url:"#/conferences", key:"Conferences"}
        , {title:"Zoom", url:"#/zoom", key:"Video Collaboration"}
        , {title:"Box", url:"#/box", key:"Box"}
    ];


    $scope.$on("$destroy", function() {
        meModel.removeListener("complete", $scope.$safeApply);
    });

};
fjs.ui.TopNavigationController.extends(fjs.ui.Controller);