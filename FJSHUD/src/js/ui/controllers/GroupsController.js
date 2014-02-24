namespace("fjs.ui");

fjs.ui.GroupsController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    var dataProvider = new fjs.fdp.DataManager();
    var groupsModel = dataProvider.getModel("groups");
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverce = false;
    $scope.groups = groupsModel.order;
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
    groupsModel.addListener("complete", update);

    $scope.$on("$destroy", function() {
        clearTimeout(timeoutId);
        groupsModel.removeListener("complete", update);
    });
};
fjs.ui.GroupsController.extend(fjs.ui.Controller);