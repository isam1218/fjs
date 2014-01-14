namespace("fjs.ui");

fjs.ui.AllContactsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var contactsModel = dataManager.getModel("contacts");
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
    };
    var timeoutId = null;

    contactsModel.addListener("complete", $scope.$safeApply);

    $scope.createContact= function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog"});
        return false;
    };

    $scope.filterContactFn = function(searchInput) {
        return function(contact){
            return contact.pass(searchInput);
        };
    };

    $scope.$on("$destroy", function() {
        contactsModel.removeListener("complete", $scope.$safeApply);
    });
};
fjs.ui.AllContactsController.extend(fjs.ui.Controller);
