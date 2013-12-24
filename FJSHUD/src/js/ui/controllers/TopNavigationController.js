namespace("fjs.ui");

fjs.ui.TopNavigationController = function($scope, dataManager) {

    fjs.ui.Controller.call(this, $scope);
    /**
     * @type {fjs.hud.MeFeedModel}
     */
    $scope.model = dataManager.getModel("me");
    $scope.model.addListener("complete", function(){
        $scope.$safeApply();
    });

    $scope.appIcons = [
        {title:"Conferencing", url:"#/conferences", key:"Conferences"}
        , {title:"Zoom", url:"#/zoom", key:"Video Collaboration"}
        , {title:"Box", url:"#/box", key:"Box"}
    ];


    $scope.$on("$destroy", function() {
        $scope.model.removeListener("complete", $scope.$safeApply);
    });

};
fjs.ui.TopNavigationController.extend(fjs.ui.Controller);