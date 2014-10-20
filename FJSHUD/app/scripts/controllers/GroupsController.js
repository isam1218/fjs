fjs.core.namespace("fjs.ui");

fjs.ui.GroupsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var groupsModel = dataManager.getModel("groups");
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverce = false;
    $scope.groups = groupsModel.items;
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
    function update() {
        if(!timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function(){
            $scope.$safeApply()
        }, 50);
    }
    groupsModel.addEventListener("complete", update);

    $scope.$on("$destroy", function() {
        clearTimeout(timeoutId);
        groupsModel.removeEventListener("complete", update);
    });
};
fjs.core.inherits(fjs.ui.GroupsController, fjs.ui.Controller)