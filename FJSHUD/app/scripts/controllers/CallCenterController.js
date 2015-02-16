hudweb.controller('CallCenterController', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'QueueService', function ($scope, $rootScope, myHttpService, contactService, queueService) {
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
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
          return a.name.localeCompare(b.Name);
        });
        break;
      case "callsWaiting":
        $scope.queues.sort(function(a, b) {
          return b.info.waiting - a.info.waiting;
        });
        break;
      case "waitTime":
        $scope.queues.sort(function(a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "talkTime":
        $scope.queues.sort(function(a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "totalCalls":
        $scope.queues.sort(function(a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "abandonedCallsa":
        $scope.queues.sort(function(a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
      case "activeCalls":
        $scope.queues.sort(function(a, b) {
          return a.info.waiting - b.info.waiting;
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

}]);
