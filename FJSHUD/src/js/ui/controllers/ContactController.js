namespace("fjs.ui");

fjs.ui.ContactController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var contactsModel = dataProvider.getModel("contacts");
    var updateFn = function(data) {
        if(data.xpid == $scope.contact.xpid ) {
            $scope.$safeApply();
        }
    };
    contactsModel.addListener('push', updateFn);

    $scope.$on("$destroy", function() {
        contactsModel.removeListener("push", updateFn);
    });
};

fjs.ui.ContactController.extends(fjs.ui.ControllerBase);
