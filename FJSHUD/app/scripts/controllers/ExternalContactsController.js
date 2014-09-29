fjs.core.namespace("fjs.ui");

fjs.ui.ExternalContactsController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var contactsModel = dataProvider.getModel("contacts");
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverce = false;
    $scope.contacts = contactsModel.items;
    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverce = false;
        }
        else {
            $scope.sortReverce = !$scope.sortReverce;
        }
    };
    contactsModel.addEventListener("complete", $scope.$safeApply());
    $scope.createContact= function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog"});
        return false;
    };

    $scope.$on("$destroy", function() {
        contactsModel.removeEventListener("complete", $scope.$safeApply);
    });

};
fjs.core.inherits(fjs.ui.ExternalContactsController, fjs.ui.Controller)
