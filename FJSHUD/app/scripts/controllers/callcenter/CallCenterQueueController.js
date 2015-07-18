hudweb.controller('CallCenterQueueController', ['$scope', '$rootScope', 'HttpService', 'SettingsService', 'QueueService', function ($scope, $rootScope, httpService, settingsService, queueService) {  
  $scope.que = {};
  $scope.que.query = '';

  queueService.getQueues().then(function(data) {
    // show all or my queues
    if ($scope.selected == 'allqueues')
      $scope.queues = data.queues;  
    else if ($scope.selected == 'myqueue')
      $scope.queues = data.mine;
    $scope.total = data.total;
  });
  
 //call truncation on select value change
 $scope.trancateSelectedName = function(){
   	if($scope.selectedQueue.display_name.length > 23)
   	{
   		$scope.selectedQueue.display_name = $scope.selectedQueue.display_name.substring(0, 22) + '...';
   	}    	
 };
 //call truncation on page load
 $scope.truncateLongAction = function()
 {
   return function(opt){
	var truncated_name = opt.display_name; 
	
	if(opt.display_name && opt.display_name.length > 23)
		truncated_name = opt.display_name.substring(0, 22) + '...';
	
    if(truncated_name == $scope.selectedQueue.display_name)
    	opt.display_name =  truncated_name;
    else
    	opt.display_name = opt.orig_name;
	return opt; 
   };	
 };	

  $scope.queue_options = [
    {display_name: $scope.verbage.queue_name, orig_name:$scope.verbage.queue_name, type: "name"},
    {display_name: $scope.verbage.queue_sort_calls_wait, orig_name:$scope.verbage.queue_sort_calls_wait, type: "info.waiting"},
    {display_name: $scope.verbage.queue_sort_longest_hold_time, orig_name:$scope.verbage.queue_sort_longest_hold_time, type: "longestWait"},
    {display_name: $scope.verbage.queue_sort_avg_talk_time, orig_name:$scope.verbage.queue_sort_avg_talk_time, type: "info.avgTalk"},
    {display_name: $scope.verbage.queue_sort_total_calls, orig_name:$scope.verbage.queue_sort_total_calls, type: "info.abandon + info.completed"},
    {display_name: $scope.verbage.queue_abandoned_calls, orig_name:$scope.verbage.queue_abandoned_calls, type: "info.abandonPercent"},
    {display_name: $scope.verbage.queue_active_calls, orig_name:$scope.verbage.queue_active_calls, type: "info.active"}
  ];
  
  $scope.selectedQueue = localStorage.queue_option ? JSON.parse(localStorage.queue_option) : $scope.queue_options[0];

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
	$scope.selectedQueue =  queueSelection;
	$scope.trancateSelectedName();
    if ($scope.sortColumn == queueSelectionType)
  	  $scope.isAscending = !$scope.isAscending;
      else if (queueSelectionType == 'name')
  	  $scope.isAscending = false;
      else
  	  $scope.isAscending = true;
  	
  	$scope.sortColumn = queueSelectionType;
    localStorage.queue_option = JSON.stringify(queueSelection);
  };
  
  $scope.resetStats = function() {
	var doIt = confirm('Are you sure you want to reset statistics for all queues?');
	
	if (doIt)
		httpService.sendAction('queues', 'resetAllQueuesStatistics');
  };

  $scope.$on("$destroy", function () {

  });

}]);
