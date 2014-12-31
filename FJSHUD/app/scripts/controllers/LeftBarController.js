/**
 * Created by vovchuk on 11/7/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	
	$scope.showOverlay = function(show) {
		if (!show)
			$scope.overlay = '';
		else if ($scope.tab != 'groups')
			$scope.overlay = 'contacts';
		else
			$scope.overlay = 'groups';
	};
};
fjs.core.inherits(fjs.ui.LeftBarController, fjs.ui.Controller)