hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', 'SettingsService', 'StorageService', function($scope, $rootScope, $routeParams, httpService, queueService, settingsService, storageService) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
	$scope.queue = queueService.getQueue($scope.queueId);
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.conversationType = 'queue';
    $scope.sortReverse = false;
    var myQueues = queueService.getMyQueues();
	
	// store recent
	storageService.saveRecent('queue', $scope.queueId);

	// for chat
	$scope.enableChat = false;
	$scope.enableFileShare = false;
    // for alerts
    $scope.showAlerts = false;
    $scope.enableAlertBroadcast = false;
    $scope.enableTextInput = false;
    
    $scope.tabs = [{upper: $scope.verbage.agents, lower: 'agents', idx: 0}, 
    {upper: $scope.verbage.stats_tab, lower: 'stats', idx: 1}, 
    {upper: $scope.verbage.calls_tab, lower: 'calls', idx: 2}, 
    {upper: $scope.verbage.chat, lower: 'chat', idx: 3}, 
    {upper: $scope.verbage.call_log_tab, lower: 'calllog', idx: 4}, 
    {upper: $scope.verbage.recordings, lower: 'recordings', idx: 5}, 
    {upper: $scope.verbage.alerts, lower: 'alerts', idx: 6}];

    $scope.toggleObject = {};
    $scope.tabObj = {};
             
    $scope.isString = function(item) {
        return angular.isString(item);
    };


    $scope.recordingPermission;
    $scope.chatPermission = false;

    settingsService.getPermissions().then(function(data){
        $scope.recordingPermission = data.showCallCenter;
    });

    if (myQueues.queues.length > 0){
        for (var i = 0; i < myQueues.queues.length; i++){
            var single = myQueues.queues[i];
            if (single.xpid === $scope.queueId){
                $scope.chatPermission = true;
                break;
            }
        }
    } else {
        $scope.chatPermission = false;
    }

    if ($routeParams.route != undefined){
        $scope.selected = $routeParams.route;
        localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
        for (var i = 0; i < $scope.tabs.length; i++){
            if ($scope.tabs[i].lower == $routeParams.route){
                $scope.toggleObject = $scope.tabs[i].idx;
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
                break;
            }
        }
    } else {
        $scope.selected = localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid]) : 'agents';
        $scope.toggleObject = localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid]) : 0;
    }


    $scope.saveQTab = function(tab, index){
        $scope.selected = tab;
        $scope.toggleObject = index;
        localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
        localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);               
    };
    
    queueService.getQueues().then(function(data) {
        // loop thru my queues and x-ref w/ current queue, if member --> allow chat / file share
        var myQueues = data.mine;
        
        // if not a member of any queues...
        if (myQueues.length === 0){
            $scope.enableAlertBroadcast = false;
            $scope.enableChat = false;
            $scope.enableFileShare = false;
        }
        else
        {
	        // if a member of a queue...
	        for (var j = 0; j < myQueues.length; j++){
	        	
	            var myPermission = myQueues[j].permissions.permissions;
	            
	            //compare the current object xpid to the queue id of the scope
	            if (myQueues[j].xpid === $scope.queueId)
	            {
	            	//we only look at the alerts and chat tabs 
	             	if($routeParams.route === 'alerts' || $routeParams.route === 'chat')
	             	{	
		            	//no permission
	             		if(myPermission === 0)
		            	{	    
	             			   // I'm a member and i have alert broadcast permission and i'm on alerts tab
		            		    $scope.enableAlertBroadcast = ($routeParams.route === 'alerts') ? true : false;
		            		
				                $scope.enableChat = true;
				                $scope.enableTextInput = true;
				                $scope.enableFileShare = true;	            		
		            	}
	             		//has permission
		            	else 
		            	{
		            		//check if queue id of the route exists, otherwise do nothing
		            		if($routeParams.queueId)
		            		{
		            			$scope.enableAlertBroadcast = false;
			                    $scope.enableTextInput = ($routeParams.route === 'chat') ? true : false;
			                    $scope.enableChat = true;
			                    $scope.enableFileShare = true;
		            		}	
		            	}	
	             	}	
	            }
	            else
	            {
	            	// I'm not a member of this current queue in the for loop
	                $scope.enableTextInput = false;
                    $scope.enableAlertBroadcast = false;
	                $scope.enableChat = false;
	                $scope.enableFileShare = false;
	            }		            
	        } 
        }
    });

}]);