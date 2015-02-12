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
