namespace("fjs.ui");

fjs.ui.TopNavigationController = function($scope) {

    fjs.ui.ControllerBase.call(this, $scope);

    var dataProvider = new fjs.fdp.FDPDataProvider();
    var meModel = dataProvider.getModel("me");
    meModel.addListener("complete", $scope.$safeApply);
    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(38, 38);
    };
    $scope.$on("$destroy", function() {
        meModel.removeListener("complete", $scope.$safeApply);
    });
    $scope.appIcons = [
        {title:"Conferencing", url:"#/conferences", key:"Conferences"}
        , {title:"Zoom", url:"#/zoom", key:"Video Collaboration"}
        , {title:"Box", url:"#/box", key:"Box"}
    ]

};
fjs.ui.TopNavigationController.extends(fjs.ui.ControllerBase);