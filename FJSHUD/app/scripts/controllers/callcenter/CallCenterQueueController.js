hudweb.controller('CallCenterQueueController', ['$scope', 'HttpService','SettingsService', function ($scope, httpService,settingsService) {  
  httpService.getFeed('queues');

  $scope.sort_options = [
    {display_name: "Queue name", type: "name"},
    {display_name: "Calls waiting", type: "info.waiting"},
    {display_name: "Average wait time (ESA)", type: "info.esa"},
    {display_name: "Average talk time", type: "info.avgTalk"},
    {display_name: "Total calls (since last reset)", type: "info.abandon + info.completed"},
    {display_name: "Abandoned calls", type: "info.abandonPercent"},
    {display_name: "Active calls", type: "info.active"}
  ];
  
  $scope.selectedSort = $scope.sort_options[0];
  $scope.sortColumn = $scope.selectedSort.type;
  $scope.isAscending = false;
  
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
  
  $scope.setSort = function(select) {
	if ($scope.sortColumn == select)
	  $scope.isAscending = !$scope.isAscending;
    else if (select == 'name')
	  $scope.isAscending = false;
    else
	  $scope.isAscending = true;
	
	$scope.sortColumn = select;
  };
  
  $scope.resetStats = function() {
	var doIt = confirm('Are you sure you want to reset statistics for all queues?');
	
	if (doIt)
		httpService.sendAction('queues', 'resetAllQueuesStatistics');
  };

  $scope.$on("$destroy", function () {

  });

}]);
