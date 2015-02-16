hudweb.controller('CallCenterController', ['$scope', 'HttpService', function ($scope, myHttpService) {
  $scope.query;
  $scope.queues = [];
  $scope.contacts = {};

  myHttpService.getFeed('queuelogoutreasons');
  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');

  $scope.tabs = ['My Queue', 'All Queues', 'My Status'];
  $scope.selected = 'All Queues';

  $scope.viewIcon = true;
  $scope.sortColumn = 'name';
  $scope.isAscending = true;

  $scope.$on('queues_updated', function (event, data) {
    $scope.queues = data.queues;

    for (var q in $scope.queues) {
      var queue = $scope.queues[q];


      if (queue.members != undefined) {
        queue.membersCount = queue.members.length;
        queue.loggedInMembers = 0;
        queue.loggedOutMembers = 0;
        for (var m in queue.members) {
          var member = queue.members[m];

          if (member.status && member.status.status == 'login') {
            queue.loggedInMembers++;
          } else {
            queue.loggedOutMembers++;
          }
        }
      }
    }
    $scope.$safeApply();
  });


  $scope.sortBy = function(type) {
    switch (type) {
      case "name":
        $scope.queues.sort(function(a, b) {
          if ($scope.isAscending) {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
        if ($scope.sortColumn == 'name') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'name';
        break;
      case "callsWaiting":
        $scope.queues.sort(function(a, b) {
          if (b && b.info && a && a.info) {
            return b.info.waiting - a.info.waiting;
          } else {
            return -1;
          }
        });
        if ($scope.sortColumn == 'callsWaiting') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'callsWaiting';
        break;
      case "avgWait":
        $scope.queues.sort(function(a, b) {
          if (b && b.info && a && a.info) {
            return b.info.waiting - a.info.waiting;
          } else {
            return -1;
          }
        });
        if ($scope.sortColumn == 'avgWait') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'avgWait';
        break;
      case "avgTalk":
        $scope.queues.sort(function(a, b) {
          return a.info.avgTalk - b.info.avgTalk;
        });
        if ($scope.sortColumn == 'avgTalk') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'avgTalk';
        break;
      case "total":
        $scope.queues.sort(function(a, b) {
          return a.info.completed - b.info.completed;
        });
        if ($scope.sortColumn == 'total') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'total';
        break;
       case "abandoned":
         $scope.queues.sort(function(a, b) {
           return a.info.abandoned - b.info.abandoned;
         });
         if ($scope.sortColumn == 'abandoned') {
           $scope.isAscending = !$scope.isAscending;
         }
         $scope.sortColumn = 'abandoned';
         break;
      case "active":
        $scope.queues.sort(function(a, b) {
          return a.info.active - b.info.active;
        });
        if ($scope.sortColumn == 'active') {
          $scope.isAscending = !$scope.isAscending;
        }
        $scope.sortColumn = 'active';
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

}]);
