hudweb.controller('CallCenterController', ['$scope', '$routeParams', 'HttpService', 'QueueService', function ($scope, $routeParams, httpService, queueService) {

	$scope.tabs = [{upper: $scope.verbage.my_queue, lower: 'myqueue'},
	{upper: $scope.verbage.all_queues, lower: 'allqueues'},
	{upper: $scope.verbage.my_status, lower: 'mystatus'}];

	$scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

	$scope.total = {};
	
	$scope.$on('queues_updated', function (event, data) {
		// show all or my queues
		if ($scope.selected == 'allqueues')
			$scope.queues = data.queues;
		else
			$scope.queues = data.mine;
		
		$scope.total = data.total;
	});
	
	$scope.$on("$destroy", function () {
	
	});
}]);
