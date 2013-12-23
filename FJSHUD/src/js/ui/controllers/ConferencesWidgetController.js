namespace("fjs.ui");

fjs.ui.ConferencesWidgetController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var conferencesModel = dataProvider.getModel("conferences");
    conferencesModel.addListener("complete", $scope.$safeApply);
    $scope.membersOrder = conferencesModel.membersOrder;
    $scope.conferences = conferencesModel.order;
    $scope.query = "";
    $scope.$on("$destroy", function() {
        conferencesModel.removeListener("complete", $scope.$safeApply);
    });
    $scope.unpin = function() {
        dataProvider.runApp("conferences");
    };
};

fjs.ui.ConferencesWidgetController.extends(fjs.ui.ControllerBase);