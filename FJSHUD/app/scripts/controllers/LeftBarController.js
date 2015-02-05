hudweb.controller('LeftBarController', ['$scope', 'HttpService', function($scope, myHttpService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	
	$scope.showOverlay = function(show) {			
		if (!show)
			$scope.overlay = '';
		else
			$scope.overlay = show;
	};
}]);