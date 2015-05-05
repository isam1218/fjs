hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'QueueService', 'SettingsService', 'UtilService', function($scope, $rootScope, $routeParams, httpService, queueService, settingsService, utilService) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
	$scope.queue = queueService.getQueue($scope.queueId);
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;
    var myQueues = queueService.getMyQueues();

	// for chat
	$scope.enableChat = false;
	$scope.enableFileShare = false;
    // for alerts
    $scope.showAlerts = false;
    $scope.enableAlertBroadcast = false;
    
    $scope.tabs = [{upper: $scope.verbage.agents, lower: 'agents'}, 
    {upper: $scope.verbage.stats_tab, lower: 'stats'}, 
    {upper: $scope.verbage.calls_tab, lower: 'calls'}, 
    {upper: $scope.verbage.chat, lower: 'chat'}, 
    {upper: $scope.verbage.call_log_tab, lower: 'calllog'}, 
    {upper: $scope.verbage.recordings, lower: 'recordings'}, 
    {upper: $scope.verbage.alerts, lower: 'alerts'}];

    $scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

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
				}
            }
			else
				return true;
        };
    };

    settingsService.getPermissions().then(function(data) {
        if (data.showAlerts){
            $scope.showAlerts = true;
        } else {
            $scope.showAlerts = false;
        }
    });
    
    queueService.getQueues().then(function(data) {
        // loop thru my queues and x-ref w/ current queue, if member --> allow chat / file share
        var myQueues = data.mine;

        for (var j = 0; j < myQueues.length; j++){
            var myPermission = myQueues[j].permissions.permissions;
            if (myQueues[j].xpid === $scope.queueId && (myPermission === 0)){
                $scope.enableAlertBroadcast = true;
                $scope.enableChat = true;
                $scope.enableFileShare = true;
            } else if (myQueues[j].xpid === $scope.queueId && (myPermission !== 0)){
                $scope.enableAlertBroadcast = false;
                $scope.enableChat = true;
                $scope.enableFileShare = true;
            }
        }
    });

}]);