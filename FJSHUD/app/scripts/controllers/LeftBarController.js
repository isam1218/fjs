fjs.ui.LeftBarController = function($scope, myHttpService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.edit = false;
	
	$scope.showOverlay = function(show, edit) {
		$scope.edit = edit ? edit : false;
			
		if (!show)
			$scope.overlay = '';
		else
			$scope.overlay = show;
	};
};