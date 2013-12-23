namespace("fjs.ui");

fjs.ui.ContactWidgetChatController = function($scope, $routeParams) {
    fjs.ui.ControllerBase.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var contactModel = dataProvider.getModel("contacts");
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactModel.items[$routeParams.contactId];
    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    }




    contactModel.addListener("push", update);

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    };

    $scope.unpin = function() {
        dataProvider.runApp("contact/"+$scope.contactId);
    };

    $scope.$on("$destroy", function() {
        contactModel.removeListener("push", update);

    });
};

fjs.ui.ContactWidgetChatController.extends(fjs.ui.ControllerBase);

