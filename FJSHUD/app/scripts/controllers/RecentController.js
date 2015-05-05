hudweb.controller('RecentController', ['$scope', '$rootScope', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService',  function($scope, $rootScope, contactService, groupService, conferenceService, queueService, httpService){
  
  var addedPid;
  var localPid;
  $scope.totalContacts = [];
  $scope.totalGroups = [];
  $scope.totalQueues = [];
  $scope.totalConferences = [];
  $scope.combined = {};
  $scope.totalCombined = [];
  $scope.recent;
  $scope.sortField = "timeline";
  var contactPagesShown = 1;
  var groupPagesShown = 1;
  var queuePagesShown = 1;
  var conferencePagesShown = 1;
  var contactPageSize = 3;
  var groupPageSize = 3;
  var queuePageSize = 3;
  var conferencePageSize = 3;
  

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

  contactService.getContacts().then(function(data) {
    $scope.totalContacts = data;

    for (var i = 0; i < $scope.totalContacts.length; i++){
      var singleContact = $scope.totalContacts[i];
      singleContact.recent_type = 'contact';
      $scope.combined[singleContact.xpid] = singleContact;
    }
  });

  $scope.$on('conferences_updated', function(event, data){
    $scope.totalConferences = data;

    for (var j = 0; j < $scope.totalConferences.length; j++){
      var singleConference = $scope.totalConferences[j];
      singleConference.recent_type = 'conference';
      $scope.combined[singleConference.xpid] = singleConference;
    }
  });

  queueService.getQueues().then(function(data) {
    $scope.totalQueues = data.queues;

    for (var k = 0; k < $scope.totalQueues.length; k++){
      var singleQueue = $scope.totalQueues[k];
      singleQueue.recent_type = 'queue';
      $scope.combined[singleQueue.xpid] = singleQueue;
    }
  });

  var groupGetter = function(){
    var totalGroups = groupService.getGroups();
    return totalGroups.then(function(result1){
      $scope.totalGroups = result1;

      for (var l = 0; l < $scope.totalGroups.length; l++){
        var singleGroup = $scope.totalGroups[l];
        singleGroup.recent_type = 'group';
        $scope.combined[singleGroup.xpid] = singleGroup;
      }
      for (var key in $scope.combined){
        var single = $scope.combined[key];
        $scope.totalCombined.push($scope.combined[key]);
      }
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

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
  $scope.searchRecentContactFilter = function(){
    return function(contact){
      if (contact.displayName.toLowerCase().indexOf($scope.$parent.query) != -1 || contact.primaryExtension.indexOf($scope.$parent.query) != -1){
        return true;
      }
    };
  };

  $scope.searchRecentGroupFilter = function(){
    return function(group){
      if (group.name.toLowerCase().indexOf($scope.$parent.query) != -1 || group.extension.indexOf($scope.$parent.query) != -1){
        return true;
      }
    };
  };

  $scope.searchRecentConfFilter = function(){
    return function(conf){
      if (conf.extensionNumber.indexOf($scope.$parent.query) != -1 || conf.name.toLowerCase().indexOf($scope.$parent.query) != -1){
        return true;
      }
    };
  };

<<<<<<< Updated upstream
=======
  $scope.sort = function(field){
    if ($scope.sortField != field){
      $scope.sortField = field;
      $scope.sortReverse = false;
    } else {
      $scope.sortReverse = !$scope.sortReverse;
    }
  };

>>>>>>> Stashed changes
  $scope.customSort = function(){
    return 'timestamp';
  };

  $scope.customReverse = function(){
    return true;
  };

  $scope.contactsLimit = function(){
    return contactPageSize * contactPagesShown;
  };

  $scope.groupsLimit = function(){
    return groupPageSize * groupPagesShown;
  };

  $scope.queuesLimit = function(){
    return queuePageSize * queuePagesShown;
  };

  $scope.conferencesLimit = function(){
    return conferencePageSize * conferencePagesShown;
  }
  
  $scope.hasMoreContactsToLoad = function(){
    var contactCounter = 0;
    for (var i = 0; i < $scope.totalContacts.length; i++){
      var singleContactXpid = $scope.totalContacts[i].xpid;
      if ($scope.recent[singleContactXpid] !== undefined)
        contactCounter++;
    }
    // console.log(contactPagesShown, ' <  (', contactCounter, ' / ', contactPageSize, ')');
    return contactPagesShown < (contactCounter / contactPageSize);
  };

  $scope.hasMoreGroupsToLoad = function(){
    var groupCounter = 0;
    for (var i = 0; i < $scope.totalGroups.length; i++){
      var singleGroupXpid = $scope.totalGroups[i].xpid;
      if ($scope.recent[singleGroupXpid] !== undefined)
        groupCounter++;
    }
    return groupPagesShown < (groupCounter / groupPageSize);
  };

  $scope.hasMoreQueuesToLoad = function(){
    var queueCounter = 0;
    for (var i = 0; i < $scope.totalQueues.length; i++){
      var singleQueueXpid = $scope.totalQueues[i].xpid;
      if ($scope.recent[singleQueueXpid] !== undefined)
        queueCounter++;
    }
    return queuePagesShown < (queueCounter / queuePageSize);
  };

  $scope.hasMoreConferencesToLoad = function(){
    var conferenceCounter = 0;
    for (var i = 0; i < $scope.totalConferences.length; i++){
      var singleConferenceXpid = $scope.totalConferences[i].xpid;
      if ($scope.recent[singleConferenceXpid] !== undefined)
        conferenceCounter++;
    }
    return conferencePagesShown < (conferenceCounter / conferencePageSize);
  };

  $scope.loadMoreContacts = function(){
    if (contactPagesShown < 3)
      contactPagesShown++;
  };

  $scope.loadMoreGroups = function(){
    if (groupPagesShown < 3)
      groupPagesShown++;
  };

  $scope.loadMoreQueues = function(){
    if (queuePagesShown < 3)
      queuePagesShown++;
  };

  $scope.loadMoreConferences = function(){
    if (conferencePagesShown < 3)
      conferencePagesShown++;
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