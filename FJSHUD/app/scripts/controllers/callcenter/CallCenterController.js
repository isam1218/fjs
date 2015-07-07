hudweb.controller('CallCenterController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', 'SettingsService', function ($scope, $rootScope, $routeParams, httpService, queueService, settingsService) {

	$scope.tabs = [{upper: $scope.verbage.my_queue, lower: 'myqueue'},
	{upper: $scope.verbage.all_queues, lower: 'allqueues'},
	{upper: $scope.verbage.my_status, lower: 'mystatus'}];

	settingsService.getSettings().then(function() {
  		$scope.globalXpid = $rootScope.myPid;
		
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
  		}
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
		$scope.total = data.total;
	});
	
	$scope.$on("$destroy", function () {
	
	});
}]);
