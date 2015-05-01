hudweb.controller('RecentController', ['$scope', '$rootScope', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService',  function($scope, $rootScope, contactService, groupService, conferenceService, queueService, httpService){
  
  var addedPid;
  var localPid;
  $scope.totalContacts = [];
  $scope.totalGroups = [];
  $scope.totalQueues = [];
  $scope.totalConferences = [];
  $scope.recent;

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}'
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.$on('recentAdded', function(event, data){
    localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
  });

  $scope.$on('contacts_updated', function(event, data){
    $scope.totalContacts = data;
  });

  $scope.$on('conferences_updated', function(event, data){
    $scope.totalConferences = data;
  });

  $scope.$on('queues_updated', function(event, data){
    $scope.totalQueues = data.queues;
  });

  var groupGetter = function(){
    var totalGroups = groupService.getGroups();
    var totalQueues = queueService.getQueues();
    return totalGroups.then(function(result1){
      $scope.totalGroups = result1;
    });
  }();


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