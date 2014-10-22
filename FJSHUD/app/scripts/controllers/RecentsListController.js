fjs.core.namespace("fjs.ui");

fjs.ui.ResentsListController = function($scope, $rootScope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("widget_history");
    $scope.resents = $scope.model.items;
	
    var oncomplete = function() {
		$rootScope.$broadcast("updateRecent", $scope.resents);
        $scope.$safeApply();
    };
	
    $scope.model.addEventListener('complete', oncomplete);
};

fjs.core.inherits(fjs.ui.ResentsListController, fjs.ui.Controller);