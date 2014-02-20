
namespace("fjs.ui");

fjs.ui.EditContactDialog = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);

    $scope.stopPropagation = function(e) {
        e.stopPropagation();
        return false;
    }

    $scope.save = function() {
        dataManager.sendAction("contacts", "addContact", {
            "a.jid":$scope.jid
            ,"a.firstName":$scope.firstName
            ,"a.lastName":$scope.lastName
            , "a.displayName":$scope.displayName
            , "a.email": $scope.email
            , "a.ims": $scope.ims
            , "a.business": $scope.business
            , "a.mobile": $scope.mobile
            , "a.favorite": $scope.favorite

    });
        $scope.$emit("showPopup", {});
    }

    $scope.cancel = function() {
        $scope.$emit("showPopup", {});
    }

    $scope.jid = "";
    $scope.ims = "";
    $scope.firstName = "";
    $scope.lastName = "";
    $scope.displayName = "";
    $scope.email = "";
    $scope.business = "";
    $scope.mobile = "";
    $scope.favorite = false;

}
fjs.ui.EditContactDialog.extend(fjs.ui.Controller);