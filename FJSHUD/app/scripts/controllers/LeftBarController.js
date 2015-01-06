/**
 * Created by vovchuk on 11/7/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope, myHttpService) {
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
	
	// notifications, TO DO: put in separate controller
	$scope.notifications = [];
	
	myHttpService.getFeed('quickinbox');
	
	$scope.$on('quickinbox_synced', function(event,data){
		for (obj in data) {
			if (data[obj].items.length > 0) {
				$scope.notifications = data[obj].items;
			}
		}
	});
};
fjs.core.inherits(fjs.ui.LeftBarController, fjs.ui.Controller)