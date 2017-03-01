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
    
    // default view
    if ($scope.selected == 'myqueue'){
      $scope.viewIcon = localStorage['myqueue_ViewIcon_of_' + $rootScope.myPid] ? JSON.parse(localStorage['myqueue_ViewIcon_of_' + $rootScope.myPid]) : true;
      $scope.selectedQueue = localStorage.queue_option_myqueue_selectedQueue ? JSON.parse(localStorage.queue_option_myqueue_selectedQueue) : $scope.queue_options[0];
      $scope.isAscending = localStorage.queue_option_myqueue_isAscending ? JSON.parse(localStorage.queue_option_myqueue_isAscending) : false;
      $scope.sortColumn = localStorage.queue_option_myqueue_sortColumn ? JSON.parse(localStorage.queue_option_myqueue_sortColumn) : $scope.selectedQueue.type;
    }
    else{
      $scope.viewIcon = localStorage['allqueues_ViewIcon_of_' + $rootScope.myPid] ? JSON.parse(localStorage['allqueues_ViewIcon_of_' + $rootScope.myPid]) : true;
      $scope.selectedQueue = localStorage.queue_option_allqueues_selectedQueue ? JSON.parse(localStorage.queue_option_allqueues_selectedQueue) : $scope.queue_options[0];
      $scope.isAscending = localStorage.queue_option_allqueues_isAscending ? JSON.parse(localStorage.queue_option_allqueues_isAscending) : false;
      $scope.sortColumn = localStorage.queue_option_allqueues_sortColumn ? JSON.parse(localStorage.queue_option_allqueues_sortColumn) : $scope.selectedQueue.type;
    }
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
  var opt_name = opt.display_name;
  
  if(opt.display_name && opt.display_name.length > 23)
    truncated_name = opt.display_name.substring(0, 22) + '...';
  
    if(truncated_name == $scope.selectedQueue.display_name || opt_name == $scope.selectedQueue.display_name)
    { 
      opt.display_name = truncated_name;
    } 
    else
      opt.display_name = opt.orig_name;
  return opt; 
   }; 
 }; 

  $scope.queue_options = [
    {display_name: $scope.verbage.queue_name, orig_name:$scope.verbage.queue_name, type: "name"},
    {display_name: $scope.verbage.queue_sort_longest_hold_time, orig_name:$scope.verbage.queue_sort_longest_hold_time, type: "longestWaitDuration"},
    {display_name: $scope.verbage.queue_sort_calls_wait, orig_name:$scope.verbage.queue_sort_calls_wait, type: "info.waiting"},
    {display_name: $scope.verbage.queue_sort_total_calls, orig_name:$scope.verbage.queue_sort_total_calls, type: "info.abandon + info.completed"},
    {display_name: $scope.verbage.queue_sort_avg_talk_time, orig_name:$scope.verbage.queue_sort_avg_talk_time, type: "info.avgTalk"},
    {display_name: $scope.verbage.queue_abandoned_calls, orig_name:$scope.verbage.queue_abandoned_calls, type: "info.abandonPercent"},
    {display_name: $scope.verbage.queue_active_calls, orig_name:$scope.verbage.queue_active_calls, type: "info.active"}
  ];
  
  $scope.queueThresholds = {};
  $scope.queueThresholds.waiting = parseInt(settingsService.getSetting('queueWaitingThreshold'));
  $scope.queueThresholds.avg_wait = parseInt(settingsService.getSetting('queueAvgWaitThreshold'));
  $scope.queueThresholds.avg_talk = parseInt(settingsService.getSetting('queueAvgTalkThresholdThreshold'));
  $scope.queueThresholds.abandoned = parseInt(settingsService.getSetting('queueAbandonThreshold'));
  
  
  $scope.setViewIcon = function(){
    $scope.viewIcon = !$scope.viewIcon;
    if ($scope.selected == 'myqueue')
      localStorage['myqueue_ViewIcon_of_' + $rootScope.myPid] = JSON.stringify($scope.viewIcon);
    else
      localStorage['allqueues_ViewIcon_of_' + $rootScope.myPid] = JSON.stringify($scope.viewIcon);
    
    // load last chosen sort option 
    if ($scope.selected == 'myqueue'){
      $scope.selectedQueue = localStorage.queue_option_myqueue_selectedQueue ? JSON.parse(localStorage.queue_option_myqueue_selectedQueue) : $scope.queue_options[0];
      $scope.isAscending = localStorage.queue_option_myqueue_isAscending ? JSON.parse(localStorage.queue_option_myqueue_isAscending) : false;
      $scope.sortColumn = localStorage.queue_option_myqueue_sortColumn ? JSON.parse(localStorage.queue_option_myqueue_sortColumn) : $scope.selectedQueue.type;
    } else {
      $scope.selectedQueue = localStorage.queue_option_allqueues_selectedQueue ? JSON.parse(localStorage.queue_option_allqueues_selectedQueue) : $scope.queue_options[0];
      $scope.isAscending = localStorage.queue_option_allqueues_isAscending ? JSON.parse(localStorage.queue_option_allqueues_isAscending) : false;
      $scope.sortColumn = localStorage.queue_option_allqueues_sortColumn ? JSON.parse(localStorage.queue_option_allqueues_sortColumn) : $scope.selectedQueue.type;
    }
  };
  
  var queue_option = {};

  $scope.setSort = function(queueSelectionType, queueSelection) {
    $scope.selectedQueue = queueSelection;
    $scope.trancateSelectedName();
    if ($scope.sortColumn == queueSelectionType)
      $scope.isAscending = !$scope.isAscending;
    else if (queueSelectionType == 'name')
      $scope.isAscending = false;
    else
      $scope.isAscending = true;
    
    $scope.sortColumn = queueSelectionType;

    // save last chosen sort option
    if ($scope.selected == 'myqueue'){
      localStorage.queue_option_myqueue_selectedQueue = JSON.stringify($scope.selectedQueue);
      localStorage.queue_option_myqueue_isAscending = JSON.stringify($scope.isAscending);
      localStorage.queue_option_myqueue_sortColumn = JSON.stringify($scope.sortColumn);
    } else {
      localStorage.queue_option_allqueues_selectedQueue = JSON.stringify($scope.selectedQueue);
      localStorage.queue_option_allqueues_isAscending = JSON.stringify($scope.isAscending);
      localStorage.queue_option_allqueues_sortColumn = JSON.stringify($scope.sortColumn);
    }
  };
  
  $scope.resetStats = function() {
	var doIt = confirm('Are you sure you want to reset statistics for all queues?');
	
	if (doIt)
		httpService.sendAction('queues', 'resetAllQueuesStatistics');
  };

  $scope.$on("$destroy", function () {

  });

}]);
