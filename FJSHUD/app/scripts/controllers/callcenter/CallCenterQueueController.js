hudweb.controller('CallCenterQueueController', ['$scope', '$rootScope', 'HttpService', 'SettingsService', 'QueueService', '$timeout', function ($scope, $rootScope, httpService, settingsService, queueService, $timeout) {  
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

  httpService.getFeed('settings');

  $scope.$on('settings_updated', function(event, data){
      if (data['hudmw_searchautoclear'] == ''){
          autoClearOn = false;
          if (autoClearOn && $scope.que.query != ''){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                  $scope.clearSearch($scope.autoClearTime);          
              } else if (autoClearOn){
                  $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              } else if (!autoClearOn){
                  $scope.autoClearTime = undefined;
              }
      }
      else if (data['hudmw_searchautoclear'] == 'true'){
          autoClearOn = true;
          if (autoClearOn && $scope.que.query != ''){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
              $scope.clearSearch($scope.autoClearTime);          
          } else if (autoClearOn){
              $scope.autoClearTime = data['hudmw_searchautocleardelay'];
          } else if (!autoClearOn){
              $scope.autoClearTime = undefined;
          }
      }        
  });

  var currentTimer = 0;

  $scope.clearSearch = function(autoClearTime){
      if (autoClearTime){
          var timeParsed = parseInt(autoClearTime + '000');
          $timeout.cancel(currentTimer);
          currentTimer = $timeout(function(){
              $scope.que.query = '';
          }, timeParsed);         
      } else if (!autoClearTime){
          return;
      }
  };

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
