hudweb.controller('RecentController', ['$scope', '$rootScope', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService',  function($scope, $rootScope, contactService, groupService, conferenceService, queueService, httpService){
  
  $scope.merged = []
  $scope.totalContacts = [];
  $scope.totalGroups = [];
  $scope.totalQueues = [];
  $scope.totalConferences = [];
  $scope.recent;
  localStorage.recent ? $scope.recent = JSON.parse(localStorage.recent) : {};
  // console.log('recent - ', $scope.recent);

  $scope.$on('contacts_updated', function(event, data){
    $scope.totalContacts = data;
  });

  $scope.$on('conferences_updated', function(event, data){
    $scope.totalConferences = data;
  });

  var groupAndQueueGetter = function(){
    var totalGroups = groupService.getGroups();
    var totalQueues = queueService.getQueues();
    return totalGroups.then(function(result1){
      $scope.totalGroups = result1;
      totalQueues.then(function(result2){
        $scope.totalQueues = result2;
      });
    });
  }();

  $scope.$on('recentAdded', function(event, data){
    $scope.recent = JSON.parse(localStorage.recent);
  });

  $scope.recentFilter = function(){
    // console.log('in recent filter! $scope.recent is - ', $scope.recent);
    return function(item){
      // grab merged item's xpid
      var currentXpid = item.xpid;
      // if the recent contact matches an item in the merged array (if it exists)
      if ($scope.recent[currentXpid] !== undefined){
        // attach a sorting timestamp
        item.timestamp = $scope.recent[currentXpid]['time'];
        return true;
      }
    };
  };

  $scope.customSort = function(){
    return 'timestamp';
  };

  $scope.customReverse = function(){
    return true;
  };

  $scope.getAvatarUrl = function(conference, index) {
    if (conference.members) {
      if (conference.members[index] !== undefined) {
        var xpid = conference.members[index].contactId;
        return httpService.get_avatar(xpid,28,28);
      } else {
        return 'img/Generic-Avatar-28.png';
      } 
    } else {
        return 'img/Generic-Avatar-28.png';
    }
  };

}]);