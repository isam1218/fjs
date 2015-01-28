fjs.ui.CallCenterController = function($scope, $rootScope, myHttpService, contactService, queueService) {
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.queues = [];
  $scope.contacts = {};
  $scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

  myHttpService.getFeed('queuelogoutreasons');
  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');

  $scope.$on('queues_updated', function(event, data) {
    $scope.queues = data.queues;
    $scope.$safeApply();
  });


  $scope.sort = function(field) {
    if($scope.sortField!=field) {
      $scope.sortField = field;
      $scope.sortReverse = false;
    }
    else {
      $scope.sortReverse = !$scope.sortReverse;
    }
  };

  // filter contacts down
  $scope.customFilter = function() {
    var tab = $scope.$parent.tab;

    return function(queue) {
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
          case 'recent':
            if ($scope.recents[contact.xpid] !== undefined) {
              // attach timestamp to sort by
              contact.timestamp = $scope.recents[contact.xpid];
              return true;
            }
            break;
          case 'queues':
            if ($scope.queues[queue.xpid] !== undefined)
              return true;
            break;
        }
      }
    };
  };

  $scope.customSort = function() {
    // recent list doesn't have a sort field
    if ($scope.$parent.tab == 'recent')
      return 'timestamp';
    else
      return $scope.sortField;
  };

  $scope.customReverse = function() {
    // recent list is always reversed
    if ($scope.$parent.tab == 'recent')
      return true;
    else
      return $scope.sortReverse;
  };

  // record most recent queue
  $scope.storeRecent = function(xpid) {
    $scope.recents[xpid] = new Date().getTime();
    localStorage.recents = JSON.stringify($scope.recents);
  };

  $scope.getAvatarUrl = function(xpid) {
    return myHttpService.get_avatar(xpid,28,28);
  };

  $scope.$on("$destroy", function() {

  });

  $scope.getAvatarUrl = function(queue, index) {

    if(queue.members){
      if (queue.members[index] !== undefined) {
        var xpid = queue.members[index].xpid;
        return myHttpService.get_avatar(xpid,14,14);
      }
      else
        return 'img/Generic-Avatar-14.png';

    }
  };
};
