namespace("fjs.ui");

fjs.ui.FavoriteContactsController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    var dataProvider = new fjs.fdp.FDPDataProvider();
    var groupContactsModel = dataProvider.getModel("groupcontacts");
    var contactsModel = dataProvider.getModel("contacts")
    var groupId = "400000000_1";
    var onGroupChanged = function(data) {
        if(data.entry && data.entry.groupId==groupId) {
            if(!$scope.contacts) {
                $scope.contacts = groupContactsModel.membersByGroupId[groupId];
            }
            $scope.$safeApply();
        }
    }

    groupContactsModel.addListener('push', onGroupChanged);

    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverce = false;

    $scope.contacts = groupContactsModel.membersByGroupId[groupId];
    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverce = false;
        }
        else {
            $scope.sortReverce = !$scope.sortReverce;
        }
    }

    $scope.changeQuery = function() {
        if($scope.query != "") {
            $scope.searchContacts = contactsModel.order;
        }
        else {
            $scope.searchContacts = [];
        }
    };

    $scope.$on("$destroy", function() {
        groupContactsModel.removeListener("push", onGroupChanged);
    });

    $scope.addToFavorites = function(xpid) {
        dataProvider.sendAction("groupcontacts", "addContactsToFavorites", {"a.contactIds":xpid});
        $scope.query = "";
    };

    $scope.close = function() {
        $scope.query = "";
    }

};
fjs.ui.FavoriteContactsController.extend(fjs.ui.Controller);
