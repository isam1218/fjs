hudweb.controller('RecentController', ['$scope', '$rootScope', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', 'HttpService', 'StorageService', 'SettingsService', '$location',  function($scope, $rootScope, contactService, groupService, conferenceService, queueService, httpService, storageService, settingsService ,$location){
  
  $scope.totalContacts = [];
  $scope.totalGroups = [];
  $scope.totalQueues = [];
  $scope.totalConferences = [];
  $scope.combined = {};
  $scope.totalCombined = [];
  $scope.recent = storageService.getRecents();
  // $scope.sortField = "timeline";
  $scope.sectionSortField = 'time';
  $scope.myPid = $rootScope.myPid;
  var contactPagesShown = 1;
  var groupPagesShown = 1;
  var queuePagesShown = 1;
  var conferencePagesShown = 1;
  var contactPageSize = 3;
  var groupPageSize = 3;
  var queuePageSize = 3;
  var conferencePageSize = 3;
  $scope.recentContactFlag = false;
  $scope.recentGroupFlag = false;
  $scope.recentQueueFlag = false;
  $scope.recentConfFlag = false;
  var mostRecentContact;
  var mostRecentGroup;
  var mostRecentQueue;
  var mostRecentConf;
  
  $scope.groupedSections = [{type: 'contact', lastTime: {}},{type: 'group', lastTime: {}},{type: 'queue', lastTime: {}},{type: 'conference', lastTime: {}}];

  // retrieve saved recents from LS (if any), then grab the most recent entry from each grouping (contact, group, queue, conf) and assign as prop to the items in groupedSections array
  $scope.$watchCollection('recent', function() {
    // grab the most recent item for each section
    for (var key in $scope.recent){
      var singleEntry = $scope.recent[key];
      if ((singleEntry.type == 'contact' && mostRecentContact === undefined) || (singleEntry.type == 'contact' && singleEntry.time > mostRecentContact.time)){
        mostRecentContact = singleEntry;
        $scope.recentContactFlag = true;
      } else if ((singleEntry.type == 'group' && mostRecentGroup === undefined) || (singleEntry.type == 'group' && singleEntry.time > mostRecentGroup.time)){
        mostRecentGroup = singleEntry;
        $scope.recentGroupFlag = true;
      } else if ((singleEntry.type == 'queue' && mostRecentQueue === undefined) || (singleEntry.type == 'queue' && singleEntry.time > mostRecentQueue.time)){
        mostRecentQueue = singleEntry;
        $scope.recentQueueFlag = true;
      } else if ((singleEntry.type == 'conference' && mostRecentConf === undefined) || (singleEntry.type == 'conference' && singleEntry.time > mostRecentConf.time)){
        mostRecentConf = singleEntry;
        $scope.recentConfFlag = true;
      }      
    }
    // take the object w/ the most recent time from that section, and add that time as property to [groupedSections]
    $scope.groupedSections[0].lastTime = mostRecentContact;
    $scope.groupedSections[1].lastTime = mostRecentGroup;
    $scope.groupedSections[2].lastTime = mostRecentQueue;
    $scope.groupedSections[3].lastTime = mostRecentConf;
  });

  contactService.getContacts().then(function(data) {
    $scope.totalContacts = data;

    for (var i = 0, iLen = $scope.totalContacts.length; i < iLen; i++){
      var singleContact = $scope.totalContacts[i];
      singleContact.recent_type = 'contact';
      $scope.combined[singleContact.xpid] = singleContact;
    }
  });

  conferenceService.getConferences().then(function(data) {
    $scope.totalConferences = data.conferences;

    for (var j = 0, jLen = $scope.totalConferences.length; j < jLen; j++){
      var singleConference = $scope.totalConferences[j];
      singleConference.recent_type = 'conference';
      $scope.combined[singleConference.xpid] = singleConference;
    }
  });

  var groupGetter = function(){
    var totalGroups = groupService.getGroups();
    return totalGroups.then(function(data){
      $scope.totalGroups = data.groups;

      for (var l = 0, lLen = $scope.totalGroups.length; l < lLen; l++){
        var singleGroup = $scope.totalGroups[l];
        singleGroup.recent_type = 'group';
        $scope.combined[singleGroup.xpid] = singleGroup;
      }
    });
  }();

  var queueGetter = function(){
    return queueService.getQueues().then(function(data) {
      $scope.totalQueues = data.queues;

      for (var k = 0, kLen = $scope.totalQueues.length; k < kLen; k++){
        var singleQueue = $scope.totalQueues[k];
        singleQueue.recent_type = 'queue';
        $scope.combined[singleQueue.xpid] = singleQueue;
      }
      for (var key in $scope.combined){
        var single = $scope.combined[key];
        $scope.totalCombined.push($scope.combined[key]);
      }
    });    
  }();

  $scope.recentFilter = function(){
    return function(item){
      // grab merged item's xpid
      var currentXpid = item.xpid;
      // if the recent contact matches an item in the merged array (if it exists)
      if (currentXpid != $scope.myPid && $scope.recent && $scope.recent[currentXpid] !== undefined){
        // attach a sorting timestamp
        item.timestamp = $scope.recent[currentXpid]['time'];
        return true;
      }
    };
  };

  $scope.showCallStatus = function($event, contact) {
    $event.stopPropagation();
        $event.preventDefault();
    
    // permission?
    if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
      return;
  
    $scope.showOverlay(true, 'CallStatusOverlay', contact);
  };

  settingsService.getSettings().then(function(data) {   
    $scope.sortField = localStorage['LeftBar_RecentContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_RecentContacts_sortTab_of_' + $rootScope.myPid]) : 'timeline';
    $scope.sortReverse = localStorage['LeftBar_RecentContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_RecentContacts_sortReverse_of_' + $rootScope.myPid]) : false;
  });

  $scope.sort = function(field){
    if ($scope.sortField != field){
      $scope.sortField = field;
      $scope.sortReverse = false;
    } else {
      $scope.sortReverse = !$scope.sortReverse;
    }
    localStorage['LeftBar_RecentContacts_sortTab_of_' + $rootScope.myPid] = JSON.stringify(field);
    localStorage['LeftBar_RecentContacts_sortReverse_of_' + $rootScope.myPid] = JSON.stringify($scope.sortReverse);
  };

  $scope.sectionSort = function(field){
    if ($scope.sectionSortField != field){
      $scope.sectionSortField = field;
      $scope.sortReverse = false;
    } else {
      $scope.sortReverse = !$scope.sortReverse;
    }
  };

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
    for (var i = 0, iLen = $scope.totalContacts.length; i < iLen; i++){
      var singleContactXpid = $scope.totalContacts[i].xpid;
      if ($scope.recent[singleContactXpid] !== undefined)
        contactCounter++;
    }
    if (contactCounter < 10)
      return contactPagesShown < (contactCounter/contactPageSize);
    else
      return contactPagesShown < 3;
  };

  $scope.hasMoreGroupsToLoad = function(){
    var groupCounter = 0;
    for (var i = 0, iLen = $scope.totalGroups.length; i < iLen; i++){
      var singleGroupXpid = $scope.totalGroups[i].xpid;
      if ($scope.recent[singleGroupXpid] !== undefined)
        groupCounter++;
    }
    if (groupCounter < 10)
      return groupPagesShown < (groupCounter / groupPageSize);
    else
      return groupPagesShown < 3;
  };

  $scope.hasMoreQueuesToLoad = function(){
    var queueCounter = 0;
    for (var i = 0, iLen = $scope.totalQueues.length; i < iLen; i++){
      var singleQueueXpid = $scope.totalQueues[i].xpid;
      if ($scope.recent[singleQueueXpid] !== undefined)
        queueCounter++;
    }
    if (queueCounter < 10)
      return queuePagesShown < (queueCounter / queuePageSize);
    else
      return queuePagesShown < 3;
  };

  $scope.hasMoreConferencesToLoad = function(){
    var conferenceCounter = 0;
    for (var i = 0, iLen = $scope.totalConferences.length; i < iLen; i++){
      var singleConferenceXpid = $scope.totalConferences[i].xpid;
      if ($scope.recent[singleConferenceXpid] !== undefined)
        conferenceCounter++;
    }
    if (conferenceCounter < 10)
      return conferencePagesShown < (conferenceCounter / conferencePageSize);
    else
      return conferencePagesShown < 3;
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
  
  $scope.getDroppableType = function(type) {
	switch(type) {
		case 'contact':
			return 'Call';
		case 'conference':
			return 'Call,Contact';
	}	
	
	return '';
  };
}]);