hudweb.controller('GroupSingleController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'SettingsService', 'StorageService', '$location', function($scope, $rootScope, $routeParams, groupService, settingsService, storageService, $location) {
	$scope.groupID = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupID);
	$scope.isMine = groupService.isMine($scope.groupID);
	
	$scope.targetId = $scope.groupID;
	$scope.conversationType = 'group';
	$scope.targetAudience = "group";
	$scope.targetType = "f.conversation.chat";
	$scope.feed = "groups";
  
	$scope.messages = [];

	$scope.tabs = [{upper: $scope.verbage.chat, lower: 'chat', idx: 0}, 
	{upper: $scope.verbage.members, lower: 'members', idx: 1}, 
	{upper: $scope.verbage.voicemail_tab, lower: 'voicemails', idx: 2}, 
	{upper: $scope.verbage.page, lower: 'page', idx: 3}, 
	{upper: $scope.verbage.recordings, lower: 'recordings', idx: 4},
  {upper: $scope.verbage.group_info, lower: 'info', idx: 5}
  ];

  //if no group exists when clicking on the group chat notification give error message.
   if($scope.group == null){
    $location.path("/settings");
    alert("We apologize but this Group no longer exists");
  }

  // store recent
  storageService.saveRecent('group', $scope.groupID);

  $scope.chatTabEnabled;
  if ($scope.isMine){
    $scope.chatTabEnabled = true;
  } else {
    $scope.chatTabEnabled = false;
  }

  $scope.recordingPerm;
  settingsService.getPermissions().then(function(data){
    $scope.recordingPerm = data.showCallCenter;
  });

  $scope.infoTab = false;
  $scope.pageTab = false;
  if ($scope.group.type != 0){
    $scope.infoTab = true;
  } else {
    $scope.pageTab = true;
  }



  // if route is defined (click on specific tab or manaully enter url)...
  if ($routeParams.route){
    $scope.selected = $routeParams.route;
    for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
      if ($scope.tabs[i].lower == $routeParams.route){
        $scope.toggleObject = $scope.tabs[i].idx;
        break;
      }
    }
    localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
    localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
  } else{
    // otherwise when route isn't defined --> used LS-saved or default
    $scope.selected = localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid]) : $scope.isMine ? 'chat' : 'members';
    $scope.toggleObject = localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid]) : $scope.isMine ? 0 : 1;
  }

  // save user's last selected tab to LS
  $scope.saveGTab = function(tab, index){
      $scope.toggleObject = index;
      localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify(tab);
      localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
  }; 
  
  $scope.$on("$destroy", function() {

  });
}]);