hudweb.controller('CallCenterController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', function ($scope, $rootScope, $routeParams, httpService, queueService) {

	$scope.tabs = [{upper: $scope.verbage.my_queue, lower: 'myqueue'},
	{upper: $scope.verbage.all_queues, lower: 'allqueues'},
	{upper: $scope.verbage.my_status, lower: 'mystatus'}];


  var getXpidInCC = $rootScope.$watch('myPid', function(newVal, oldVal){
  	if (!$scope.globalXpid){
  		$scope.globalXpid = newVal;
		if($routeParams.route != undefined){
	  		$scope.selected = $routeParams.route;
	  		localStorage['CallCenter_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
			for(var i = 0; i < $scope.tabs.length;i++){
	  			if($scope.tabs[i].lower == $routeParams.route){
	  				$scope.toggleObject = {item: i};
	  				localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);

	           break;
	  			}
	  		}
		}else{
			$scope.selected = localStorage['CallCenter_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
			$scope.toggleObject = localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
			getXpidInCC();
  		}
  	} else {
  		getXpidInCC();
  	}
  });

  $scope.$on('pidAdded', function(event, data){
  	$scope.globalXpid = data.info;
  	
	$scope.selected = localStorage['CallCenter_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
	$scope.toggleObject = localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  	
  });

	$scope.selected = localStorage['CallCenter_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
	$scope.toggleObject = localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid]) : {item: 0};

	$scope.saveTab = function(tab, index){
		switch(tab){
			case "myqueue":
				$scope.selected = $scope.tabs[0].lower;
				localStorage['CallCenter_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
				$scope.toggleObject = {item: index};
				localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
				break;
			case "allqueues":
				$scope.selected = $scope.tabs[1].lower;
				localStorage['CallCenter_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
				$scope.toggleObject = {item: index};
				localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
				break;
			case "mystatus":
				$scope.selected = $scope.tabs[2].lower;
				localStorage['CallCenter_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
				$scope.toggleObject = {item: index};
				localStorage['CallCenter_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
				break;
		}
	};

	$scope.total = {};
	
	queueService.getQueues().then(function(data) {
		// show all or my queues
		// console.log('my qs -', data.mine);
		// console.log('all qs - ', data.queues);
		if ($scope.selected == 'allqueues')
			$scope.queues = data.queues;	
		else if ($scope.selected == 'myqueue')
			$scope.queues = data.mine;
		
		$scope.total = data.total;
	});
	
	$scope.$on("$destroy", function () {
	
	});
}]);
