fjs.core.namespace("fjs.ui");

fjs.ui.TopNavigationController = function($scope, dataManager) {

    fjs.ui.Controller.call(this, $scope);
    /**
     * @type {fjs.hud.MeFeedModel}
     */
    $scope.model = dataManager.getModel("me");
    $scope.model.addEventListener("complete", function(){
        $scope.$safeApply();
    });

    $scope.appIcons = [
        {title:"Contacts", url:"#/contacts", key:"Contacts"}
        , {title:"Conferencing", url:"#/conferences", key:"Conferences"}
        , {title:"Calls and Recordings", url:"#/calllog", key:"CallLog"}
        , {title:"Video Collaboration", url:"#/zoom", key:"Zoom"}
        , {title:"Box", url:"#/box", key:"Box"}
    ];


    $scope.$on("$destroy", function() {
        $scope.model.removeEventListener("complete", $scope.$safeApply);
    });

};
fjs.core.inherits(fjs.ui.TopNavigationController, fjs.ui.Controller);