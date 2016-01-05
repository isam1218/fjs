hudweb.controller('CallCenterController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', 'SettingsService', function ($scope, $rootScope, $routeParams, httpService, queueService, settingsService) {

	$scope.tabs = [{upper: $scope.verbage.my_queue, lower: 'myqueue'},
	{upper: $scope.verbage.all_queues, lower: 'allqueues'},
	{upper: $scope.verbage.my_status, lower: 'mystatus'}];
    	
	// if route is defined (click on specific tab or manaully enter url)...
	if ($routeParams.route){
		$scope.selected = $routeParams.route;
		for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++){			
			if ($scope.tabs[i].lower == $routeParams.route){
				$scope.toggleObject = {item: i};
				break;
			}
		}
		localStorage['CallCenter_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
		localStorage['CallCenter_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
	} else {
		// otherwise when route isn't defined, use the tabs set in app.js 
	    $scope.selected = localStorage['CallCenter_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallCenter_tabs_of_' + $rootScope.myPid]) : 'myqueue';       
	    
	    $scope.toggleObject = localStorage['CallCenter_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallCenter_toggleObject_of_' + $rootScope.myPid]) : {item: 0};	    	    
	}
	
	if(localStorage['showCallCenter'] == 'false')//!$rootScope.in_queue
    {	
    	$scope.selected = 'allqueues';    	
    }
    		
	$scope.tabFilter = function(){		
		return function(tab){
			if(tab.lower == 'allqueues' || (tab.lower != 'allqueues' && $rootScope.in_queue))
				return true;
			else
				return false;
			
			return true;
		};
	};
	
	$scope.saveTab = function(tab, index){
		switch(tab){
			case "myqueue":
				var tabName = $scope.tabs[0].lower;
				break;
			case "allqueues":
				var tabName = $scope.tabs[1].lower;
				break;
			case "mystatus":
				var tabName = $scope.tabs[2].lower;
				break;
		}
		
		localStorage['CallCenter_tabs_of_' + $rootScope.myPid] = JSON.stringify(tabName);
		$scope.toggleObject = {item: index};
		localStorage['CallCenter_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
	};

	$scope.total = {};
	
	queueService.getQueues().then(function(data) {		
		$scope.total = data.total;
	});
	
	$scope.$on("$destroy", function () {
	
	});
}]);
