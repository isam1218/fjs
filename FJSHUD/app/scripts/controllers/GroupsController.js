fjs.core.namespace("fjs.ui");

fjs.ui.GroupsController = function($scope, $rootScope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var groupsModel = dataManager.getModel("groups");
    $scope.query = "";
    $scope.sortField = "name";
    $scope.sortReverce = false;
    $scope.groups = groupsModel.items;
	$scope.mine = null;
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
			// find my department
			for (var group in $scope.groups) {
				if ($scope.groups[group].memberIds.indexOf($rootScope.myPid) != -1) {
					$scope.mine = $scope.groups[group];
					break;
				}
			}
			
            $scope.$safeApply();
        }, 50);
    }
    groupsModel.addEventListener("complete", update);

    $scope.$on("$destroy", function() {
        clearTimeout(timeoutId);
        groupsModel.removeEventListener("complete", update);
    });
};
fjs.core.inherits(fjs.ui.GroupsController, fjs.ui.Controller)