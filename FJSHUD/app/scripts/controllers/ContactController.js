fjs.core.namespace("fjs.ui");

fjs.ui.ContactController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var contactsModel = dataProvider.getModel("contacts");
    var updateFn = function(data) {
        if(data.xpid == $scope.contact.xpid ) {
            $scope.$safeApply();
        }
    };
    contactsModel.addEventListener('push', updateFn);

    $scope.$on("$destroy", function() {
        contactsModel.removeEventListener("push", updateFn);
    });
};

fjs.core.inherits(fjs.ui.ContactController, fjs.ui.Controller)
