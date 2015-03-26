hudweb.controller('CallCenterQueueController', ['$scope', 'HttpService','SettingsService', function ($scope, httpService,settingsService) {
  $scope.query = '';
  $scope.newObj = {};
  $scope.newObj.query = '';
	
  httpService.getFeed('queues');

  $scope.sort_options = [
    {display_name: "Queue name", type: "name"},
    {display_name: "Calls waiting", type: "callsWaiting"},
    {display_name: "Average wait time (ESA)", type: "avgWait"},
    {display_name: "Average talk time", type: "avgTalk"},
    {display_name: "Total calls (since last reset)", type: "total"},
    {display_name: "Abandoned calls", type: "abandoned"},
    {display_name: "Active calls", type: "active"}
  ];
  $scope.selectedSort = $scope.sort_options[0];
  $scope.viewIcon = false;
  $scope.sortColumn = 'name';
  $scope.isAscending = true;
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

  $scope.queueFilter = function(){
    var query = $scope.newObj.query.toLowerCase();
    // check the queue name too
    return function(queue){
      if ($scope.newObj.query === ''){
        return true;
      } else if (queue.members.length){
        for (i = 0; i < queue.members.length; i++){
          var individualMember = queue.members[i];
          if (individualMember.displayName.toLowerCase().indexOf(query) !== -1 || individualMember.extension.indexOf(query) !== -1 || queue.name.toLowerCase().indexOf(query) !== -1){
            return true;
          }
        }
      }
    };
  };
  
  $scope.resetStats = function() {
	var doIt = confirm('Are you sure you want to reset statistics for all queues?');
	
	if (doIt)
		httpService.sendAction('queues', 'resetAllQueuesStatistics');
  };

  $scope.sortBy = function (type) {

    switch (type) {
      case "name":
        $scope.queues.sort(function (a, b) {
          if ($scope.isAscending) {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
        break;
      case "callsWaiting":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.waiting - b.info.waiting;
            } else {
              return b.info.waiting - a.info.waiting;
            }
          } else {
            return 0;
          }
        });

        break;
      case "avgWait":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgWait - b.info.avgWait;
            } else {
              return b.info.avgWait - a.info.avgWait;
            }
          } else {
            return 0;
          }
        });
        break;
      case "avgTalk":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgTalk - b.info.avgTalk;
            } else {
              return b.info.avgTalk - a.info.avgTalk;
            }
          } else {
            return 0;
          }
        });
        break;
      case "total":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.completed - b.info.completed;
            } else {
              return b.info.completed - a.info.completed;
            }
          } else {
            return 0;
          }
        });

        break;
      case "abandoned":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.abandoned - b.info.abandoned;
            } else {
              return b.info.abandoned - a.info.abandoned;
            }
          } else {
            return 0;
          }
        });
        break;
      case "active":
        $scope.queues.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.active - b.info.active;
            } else {
              return b.info.active - a.info.active;
            }
          } else {
            return 0;
          }
        });
        break;
    }
    if ($scope.sortColumn == type) {
      $scope.isAscending = !$scope.isAscending;
    }
    $scope.sortColumn = type;
  };

  $scope.$on("$destroy", function () {

  });

}]);
