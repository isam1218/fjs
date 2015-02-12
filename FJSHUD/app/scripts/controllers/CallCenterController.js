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


  $scope.sort = function (field) {
    if ($scope.sortField != field) {
      $scope.sortField = field;
      $scope.sortReverse = false;
    }
    else {
      $scope.sortReverse = !$scope.sortReverse;
    }
  };

  // filter contacts down
  $scope.customFilter = function () {
    var tab = $scope.$parent.tab;

    return function (queue) {
      // remove self
      if (contact.xpid != $rootScope.myPid) {
        // filter by tab
        switch (tab) {
          case 'all':
            return true;
            break;
          case 'external':
            if (contact.primaryExtension == '')
              return true;
            break;
          case 'queues':
            if ($scope.queues[queue.xpid] !== undefined)
              return true;
            break;
        }
      }
    };
  };

  $scope.customSort = function () {
    // recent list doesn't have a sort field
    if ($scope.$parent.tab == 'recent')
      return 'timestamp';
    else
      return $scope.sortField;
  };

  $scope.customReverse = function () {
    // recent list is always reversed
    if ($scope.$parent.tab == 'recent')
      return true;
    else
      return $scope.sortReverse;
  };

  $scope.getAvatarUrl = function (xpid) {
    return myHttpService.get_avatar(xpid, 28, 28);
  };

  $scope.$on("$destroy", function () {

  });

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
