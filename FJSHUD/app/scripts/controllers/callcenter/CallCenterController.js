hudweb.controller('CallCenterController', ['$scope', 'HttpService', 'QueueService', function ($scope, httpService, queueService) {
	$scope.tabs = ['My Queue', 'All Queues', 'My Status'];
	$scope.selected = 'My Queue';
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
