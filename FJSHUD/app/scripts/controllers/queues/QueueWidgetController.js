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
    
    httpService.getFeed('queues');
    httpService.getFeed('queue_stat_calls');
    httpService.getFeed('queuepermissions');

    $scope.tabFilter = function(){
        return function(tab){
            if (tab.lower === 'chat'){
                // if not my queue -> return false and filter out the chat tab
                if (myQueues.queues.length > 0){
                    for (var i = 0; i < myQueues.queues.length; i++){
                        var single = myQueues.queues[i];
                        if (single.xpid === $scope.queueId){
                            return true;
                        } else {
                            return false;
                        }
                    }                    
                } else {
                    return false;
                }
            }
            if (tab.lower === 'alerts'){
                if (myQueues.queues.length > 0){
                    for (var i = 0; i < myQueues.queues.length; i++){
                        var single = myQueues.queues[i];
                        if (single.xpid === $scope.queueId){
                            return true;
                        } else {
                            return false;
                        }
                    }                                    
                } else {
                    return false;
                }
            }
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
    
    $scope.$on('queues_updated', function(event, data) {
        // all queues
        
        var queues = data.queues;
        for (i = 0; i < queues.length; i++) {
            if (queues[i].xpid == $scope.queueId) {
                $scope.queue = queues[i];
            }
        }
        
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