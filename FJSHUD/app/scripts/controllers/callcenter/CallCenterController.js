hudweb.controller('CallCenterController', ['$scope', '$routeParams', 'HttpService', 'QueueService', function ($scope, $routeParams, httpService, queueService) {

	$scope.tabs = [{upper: 'My Queue', lower: 'myqueue'},{upper: 'All Queues', lower: 'allqueues'},{upper: 'My Status', lower: 'mystatus'}];

	$scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

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
