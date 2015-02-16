hudweb.controller('CallCenterMyQueueController', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'QueueService', function ($scope, $rootScope, myHttpService, contactService, queueService) {
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.queues = [];
  $scope.me = [];

  myHttpService.getFeed('me');
  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');

  $scope.tabs = ['My Queue', 'All Queues', 'My Status'];
  $scope.selected = 'My Queue';

  $scope.sort_options = [
    {display_name: "Queue name", type: "name"},
    {display_name: "Calls waiting", type: "callsWaiting"},
    {display_name: "Average wait time (ESA)", type: "waitTime"},
    {display_name: "Average talk time", type: "talkTime"},
    {display_name: "Total calls (since last reset)", type: "totalCalls"},
    {display_name: "Abandoned calls", type: "abandonedCalls"},
    {display_name: "Active calls", type: "activeCalls"}
  ];
  $scope.selectedSort = $scope.sort_options[0];

  $scope.viewIcon = false;
  $scope.sortColumn = 'name';
  $scope.isAscending = true;

  $scope.$on('queues_updated', function (event, data) {
    var queues = data.queues;
    var my_pid = $scope.me['my_pid'];

    for (var q in queues) {
      var queue = queues[q];

      if (queue.members) {
        for (var m in queue.members) {
          var member = queue.members[m];

          if (member.contactId === my_pid) {
            $scope.queues.push(queue);
          }
        }

      }
      // testing REMOVE THIS CODE
      if (q == 0 && $scope.queues.length == 0) {
        $scope.queues.push(queue);

      }
      // REMOVE THIS CODE
    }


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

  $scope.sortBy = function (type) {
    switch (type) {
      case "name":
        $scope.queues.sort(function (a, b) {
          return a.name.localeCompare(b.Name);
        });
        break;
      case "callsWaiting":
        $scope.queues.sort(function (a, b) {
          return b.info.waiting - a.info.waiting;
        });
        break;
      case "waitTime":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "talkTime":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "totalCalls":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "abandonedCallsa":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "activeCalls":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
    }
  };

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

  $scope.$on("$destroy", function () {

  });

}]);
