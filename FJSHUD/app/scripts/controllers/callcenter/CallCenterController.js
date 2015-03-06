hudweb.controller('CallCenterController', ['$scope', 'HttpService', 'QueueService', function ($scope, myHttpService, queueService) {
  $scope.query = '';
  $scope.queues = [];
  $scope.contacts = {};
  $scope.me = [];

  myHttpService.getFeed('queuelogoutreasons');
  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');

  $scope.tabs = ['My Queue', 'All Queues', 'My Status'];

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
  $scope.selected = 'My Queue';
  $scope.sortColumn = 'name';
  $scope.isAscending = true;

  $scope.init = function (viewTile, selectedTab) {
    $scope.viewIcon = viewTile;
    $scope.selected = selectedTab;

    switch (selectedTab) {
      case 'All Queues':
        $scope.$on('queues_updated', function (event, data) {
          $scope.queues = data.queues;
		  
          $scope.$safeApply();
        });
        break;

      case 'My Queue':
        $scope.$on('queues_updated', function (event, data) {
          $scope.queues = data.mine;
		  $scope.$safeApply();
        });

        $scope.$on('me_synced', function (event, data) {
          if (data) {
            for (var medata in data) {
              $scope.me[data[medata].propertyKey] = data[medata].propertyValue;
            }
          }

          $scope.$apply();
        });

        break;
    }

  };

  $scope.$on("$destroy", function () {

  });

  $scope.getAvatarUrl = function (xpid) {
    return myHttpService.get_avatar(xpid, 28, 28);
  };

  $scope.getAvatarUrl = function (queue, index) {

    if (queue.members) {
      if (queue.members[index] !== undefined) {
        var xpid = queue.members[index].xpid;
        return myHttpService.get_avatar(xpid, 14, 14);
      }
      else
        return 'img/Generic-Avatar-14.png';

    }
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

}])
;
