hudweb.controller('CallCenterQueueController', ['$scope', '$rootScope', 'HttpService','SettingsService', function ($scope, $rootScope, httpService,settingsService) {  
  var addedPid;
  var localPid;
  httpService.getFeed('queues');

  $scope.queue_options = [
    {display_name: $scope.verbage.queue_name, type: "name"},
    {display_name: $scope.verbage.queue_sort_calls_wait, type: "info.waiting"},
    {display_name: $scope.verbage.queue_sort_avg_wait_time, type: "info.esa"},
    {display_name: $scope.verbage.queue_sort_avg_talk_time, type: "info.avgTalk"},
    {display_name: $scope.verbage.queue_sort_total_calls, type: "info.abandon + info.completed"},
    {display_name: $scope.verbage.queue_abandoned_calls, type: "info.abandonPercent"},
    {display_name: $scope.verbage.queue_active_calls, type: "info.active"}
  ];
  
  $scope.selectedQueue = localStorage.queue_option ? JSON.parse(localStorage.queue_option) : $scope.queue_options[0];

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}';
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.isAscending = false;
  $scope.sortColumn = $scope.selectedQueue.type;
  
  $scope.queueThresholds = {};
  $scope.queueThresholds.waiting = parseInt(settingsService.getSetting('queueWaitingThreshold'));
  $scope.queueThresholds.avg_wait = parseInt(settingsService.getSetting('queueAvgWaitThreshold'));
  $scope.queueThresholds.avg_talk = parseInt(settingsService.getSetting('queueAvgTalkThresholdThreshold'));
  $scope.queueThresholds.abandoned = parseInt(settingsService.getSetting('queueAbandonThreshold'));
  
  // default view
  if ($scope.selected == 'My Queue')
	  $scope.viewIcon = false;
  else
	  $scope.viewIcon = true;
  
  $scope.setSort = function(queueSelectionType, queueSelection) {
  	localPid = JSON.parse(localStorage.me);
    if ($scope.sortColumn == queueSelectionType)
  	  $scope.isAscending = !$scope.isAscending;
      else if (queueSelectionType == 'name')
  	  $scope.isAscending = false;
      else
  	  $scope.isAscending = true;
  	
  	$scope.sortColumn = queueSelectionType;
    localStorage.queue_option = JSON.stringify(queueSelection);
  };

  $scope.storeRecentQueue = function(queueXpid){
    localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
    $scope.recent[queueXpid] = {
      type: 'queue',
      time: new Date().getTime()
    };
    localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
    $rootScope.$broadcast('recentAdded', {info: queueXpid});
  };
  
  $scope.resetStats = function() {
	var doIt = confirm('Are you sure you want to reset statistics for all queues?');
	
	if (doIt)
		httpService.sendAction('queues', 'resetAllQueuesStatistics');
  };

  $scope.$on("$destroy", function () {

  });

}]);
