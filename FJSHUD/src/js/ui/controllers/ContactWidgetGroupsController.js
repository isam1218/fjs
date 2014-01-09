namespace("fjs.ui");

fjs.ui.ContactWidgetGroupsController = function($scope, $routeParams) {
    fjs.ui.Controller.call(this, $scope);
    var dataProvider = new fjs.hud.FDPDataManager();
    var contactModel = dataProvider.getModel("contacts");
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactModel.items[$routeParams.contactId];
    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            $scope.$safeApply();
        }
    }
    contactModel.addListener("push", update);

    var groupcontactsModel = dataProvider.getModel("groupcontacts");

    groupcontactsModel.addListener("complete", $scope.$safeApply);

    $scope.query = "";

    $scope.groups = groupcontactsModel["membersByContatcId"][$scope.contactId];


    $scope.$on("$destroy", function() {
        contactModel.removeListener("push", update);
        groupcontactsModel.removeListener("complete", $scope.$safeApply);
    });
};

fjs.ui.ContactWidgetGroupsController.extend(fjs.ui.Controller);
