hudweb.controller('QueueWidgetCallLogController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function ($scope, $rootScope, $routeParams, myHttpService) {
  $scope.queueId = $routeParams.queueId;
  $scope.query = "";
  $scope.isAscending = true;
  $scope.recentSelectSort = 'Name';
  $scope.callLogs = [];

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Call Log';

  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');
  myHttpService.getFeed('queuemembercalls');


  $scope.$on('queues_updated', function (event, data) {
    var queues = data.queues;
    for (var q in queues) {
      var queue = queues[q];

      if (queue.xpid === $scope.queueId) {
        $scope.queue = queue;
        $scope.callLogs = queue.callLogs;
      }
    }
  });

  $scope.sortBy = function (type) {

    if ($scope.callLogs) {
      switch (type) {
        case "Name":
          $scope.callLogs.sort(function (a, b) {
            if ($scope.isAscending) {
              return a.displayName.localeCompare(b.displayName);
            } else {
              return b.displayName.localeCompare(a.displayName);
            }
          });
          break;
        case "Phone":
          $scope.callLogs.sort(function (a, b) {
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
        case "Duration":
          $scope.callLogs.sort(function (a, b) {
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
        case "Date":
          $scope.callLogs.sort(function (a, b) {
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

        case "Date":
          $scope.callLogs.sort(function (a, b) {
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
      }
    }
    if ($scope.recentSelectSort == type) {
      $scope.isAscending = !$scope.isAscending;
    }
    $scope.recentSelectSort = type;
  };

  $scope.getAvatarUrl = function (xpid) {
    if (xpid !== undefined) {
      return myHttpService.get_avatar(xpid, 32, 32);
    }
    else
      return 'img/Generic-Avatar-32.png';
  };

}]);
