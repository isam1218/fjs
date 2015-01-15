fjs.ui.LeftBarController = function($scope, myHttpService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.edit = false;
	
	$scope.showOverlay = function(show, edit) {
		$scope.edit = edit ? edit : false;
			
		if (!show)
			$scope.overlay = '';
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};
	
	
};