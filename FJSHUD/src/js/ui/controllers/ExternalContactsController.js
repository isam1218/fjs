namespace("fjs.ui");

fjs.ui.ExternalContactsController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var contactsModel = dataProvider.getModel("contacts");
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverce = false;
    $scope.contacts = contactsModel.order;
    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverce = false;
        }
        else {
            $scope.sortReverce = !$scope.sortReverce;
        }
    }
    contactsModel.addListener("complete", $scope.$safeApply());
    $scope.createContact= function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog"});
        return false;
    };

    $scope.$on("$destroy", function() {
        contactsModel.removeListener("complete", $scope.$safeApply);
    });

};
fjs.ui.ExternalContactsController.extends(fjs.ui.ControllerBase);
