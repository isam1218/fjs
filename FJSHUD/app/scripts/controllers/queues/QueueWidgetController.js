hudweb.controller('QueueWidgetController', ['$scope', '$rootScope', '$routeParams', 'QueueService', 'SettingsService', 'StorageService', '$location', function($scope, $rootScope, $routeParams, queueService, settingsService, storageService, $location) {
    $scope.queueId = $scope.targetId = $routeParams.queueId;
    $scope.queue = queueService.getQueue($scope.queueId);
    $scope.query = "";
    $scope.sortField = "displayName";
    $scope.conversationType = 'queue';
    $scope.sortReverse = false;
    var myQueues = queueService.getMyQueues();
    
    // store recent
    storageService.saveRecent('queue', $scope.queueId);
    
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
    $scope.chatTabEnabled = false;

    settingsService.getPermissions().then(function(data){
        $scope.recordingPermission = data.showCallCenter;
    });

    if (myQueues.queues.length > 0){
        for (var i = 0, iLen = myQueues.queues.length; i < iLen; i++){
            var single = myQueues.queues[i];
            if (single.xpid === $scope.queueId){
                $scope.chatTabEnabled = true;
                break;
            }
        }
    } else {
        $scope.chatTabEnabled = false;
    }

    // if route is defined (click on specific tab or manaully enter url)...
    if ($routeParams.route){
        $scope.selected = $routeParams.route;
        for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
            if ($scope.tabs[i].lower == $routeParams.route){
                $scope.toggleObject = $scope.tabs[i].idx;
                break;
            }
        }
        localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
        localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
    } else {
        // otherwise when route isn't defined --> used LS-saved or default
        $scope.selected = localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid]) : 'agents';
        $scope.toggleObject = localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid]) : 0;
    }

    $scope.saveQTab = function(tab, index){
        $scope.toggleObject = index;
        localStorage['QueueWidget_' + $routeParams.queueId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify(tab);
        localStorage['QueueWidget_' + $routeParams.queueId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
    };

}]);