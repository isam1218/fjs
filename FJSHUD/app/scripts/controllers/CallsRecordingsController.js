fjs.core.namespace("fjs.ui");

fjs.ui.CallsRecordingsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var calllogModel = dataManager.getModel("calllog");
    document.title= "Calls & Recordings";
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverce = false;
    $scope.contacts = calllogModel.items;

    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverce = false;
        }
        else {
            $scope.sortReverce = !$scope.sortReverce;
        }
    };
//    var timeoutId = null;



//    $scope.createContact= function(e) {
//        e.stopPropagation();
//        $scope.$emit("showPopup", {key:"EditContactDialog"});
//        return false;
//    };
//
//    $scope.filterContactFn = function(searchInput) {
//        return function(contact){
//            if(searchInput) {
//                return contact.pass(searchInput);
//            }
//            return true;
//        };
//    };

    $scope.$on("$destroy", function() {

    });
};
fjs.core.inherits(fjs.ui.CallsRecordingsController, fjs.ui.Controller)
