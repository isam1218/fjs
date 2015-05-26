hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', 'SettingsService', function($scope, $rootScope, $routeParams, httpService, queueService, settingsService) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
	$scope.queue = queueService.getQueue($scope.queueId);
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.conversationType = 'queue';
    $scope.sortReverse = false;
    var myQueues = queueService.getMyQueues();

	// for chat
	$scope.enableChat = false;
	$scope.enableFileShare = false;
    // for alerts
    $scope.showAlerts = false;
    $scope.enableAlertBroadcast = false;
    $scope.enableTextInput = false;
    
    $scope.tabs = [{upper: $scope.verbage.agents, lower: 'agents'}, 
    {upper: $scope.verbage.stats_tab, lower: 'stats'}, 
    {upper: $scope.verbage.calls_tab, lower: 'calls'}, 
    {upper: $scope.verbage.chat, lower: 'chat'}, 
    {upper: $scope.verbage.call_log_tab, lower: 'calllog'}, 
    {upper: $scope.verbage.recordings, lower: 'recordings'}, 
    {upper: $scope.verbage.alerts, lower: 'alerts'}];

    var getXpidInQ = $rootScope.$watch('myPid', function(newVal, oldVal){
        if (!$scope.globalXpid){
            $scope.globalXpid = newVal;
                $scope.selected = localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
                $scope.toggleObject = localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
                getXpidInQ();
        } else {
            getXpidInQ();
        }
    });

    $scope.$on('pidAdded', function(event, data){
        $scope.globalXpid = data.info;
        $scope.selected = localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
        $scope.toggleObject = localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0}; 
    });

    $scope.saveQTab = function(tab, index){
        switch(tab){
            case "agents":
                $scope.selected = $scope.tabs[0].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "stats":
                $scope.selected = $scope.tabs[1].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "calls":
                $scope.selected = $scope.tabs[2].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "chat":
                $scope.selected = $scope.tabs[3].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "calllog":
                $scope.selected = $scope.tabs[4].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "recordings":
                $scope.selected = $scope.tabs[5].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "alerts":
                $scope.selected = $scope.tabs[6].lower;
                localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
        }
    }; 

    $scope.tabFilter = function(){
        return function(tab){
            if (tab.lower === 'chat'){
                // if not my queue -> return false and filter out the chat tab
                if (myQueues.queues.length > 0){
                    for (var i = 0; i < myQueues.queues.length; i++){
                        var single = myQueues.queues[i];
                        if (single.xpid === $scope.queueId){
                            return true;
                        }
                    }
                    return false;
				}
            }
            else if (tab.lower === 'alerts'){
                if (myQueues.queues.length > 0){
                    for (var i = 0; i < myQueues.queues.length; i++){
                        var single = myQueues.queues[i];
                        if (single.xpid === $scope.queueId){
                            return true;
                        }
                    }
                    return false;    
				}
            }
			else
				return true;
        };
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

        // if a member of a queue...
        for (var j = 0; j < myQueues.length; j++){
            var myPermission = myQueues[j].permissions.permissions;
            if (myQueues[j].xpid === $scope.queueId && (myPermission === 0) && $routeParams.route === 'alerts'){
                // I'm a member and i have alert broadcast permission and i'm on alerts tab
                // console.log('Im a member of this q + perm 0 + alerts tab', myPermission);
                $scope.enableAlertBroadcast = true;
                $scope.enableChat = true;
                $scope.enableTextInput = true;
                $scope.enableFileShare = true;
            } else if (myQueues[j].xpid === $scope.queueId && (myPermission === 0) && $routeParams.route === "chat"){
                // im a member i have alert broadcast perm and im on chats tab
                // console.log('Im a member of this q + perm 0 + chat tab', myPermission);
                $scope.enableAlertBroadcast = false;
                $scope.enableChat = true;
                $scope.enableTextInput = true;
                $scope.enableFileShare = true;
            } else if (myQueues[j].xpid === $scope.queueId && (myPermission !== 0)){
                // console.log('Im a member of this q + perm > 0', myPermission);
                if ($routeParams.queueId && $routeParams.route === "chat"){
                    $scope.enableAlertBroadcast = false;
                    $scope.enableTextInput = true;
                    $scope.enableChat = true;
                    $scope.enableFileShare = true;
                } else if ($routeParams.queueId && $routeParams.route === 'alerts'){
                    $scope.enableAlertBroadcast = false;
                    $scope.enableTextInput = false;
                    $scope.enableChat = true;
                    $scope.enableFileShare = true;
                }
            } else if (myQueues[j].xpid !== $scope.queueId){
                // I'm not a member of this current queue in the for loop
                // console.log('im not a member of this q', myPermission);
                $scope.enableAlertBroadcast = false;
                $scope.enableChat = false;
                $scope.enableFileShare = false;
            }
        } 
    });

}]);