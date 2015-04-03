hudweb.controller('CallCenterController', ['$scope', '$location', 'HttpService', 'QueueService', function ($scope, $location, httpService, queueService) {
	// $scope.tabs = ['My Queue', 'All Queues', 'My Status'];
	$scope.selected = 'My Queue';

	$scope.tabs = [{upper: 'My Queue', lower: 'myqueue'},{upper: 'All Queues', lower: 'allqueues'},{upper: 'My Status', lower: 'mystatus'}];

	if ($location.path().indexOf('/myqueue') !== -1){
		$scope.selected = 'My Queue';
	} else if ($location.path().indexOf('/allqueues') !== -1){
		$scope.selected = 'All Queues';
	} else if ($location.path().indexOf('/mystatus') !== -1){
		$scope.selected = 'My Status';
	}

	$scope.total = {};
	
	$scope.$on('queues_updated', function (event, data) {
		// show all or my queues
		if ($scope.selected == 'All Queues')
			$scope.queues = data.queues;
		else
			$scope.queues = data.mine;
		
		$scope.total = data.total;
	});
	
	$scope.$on("$destroy", function () {
	
	});
}]);
