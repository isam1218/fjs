hudweb.controller('GroupSingleController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'SettingsService', 'StorageService', function($scope, $rootScope, $routeParams, groupService, settingsService, storageService) {
	$scope.groupID = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupID);
	$scope.isMine = groupService.isMine($scope.groupID);
	
	$scope.targetId = $scope.groupID;
	$scope.conversationType = 'group';
	$scope.targetAudience = "group";
	$scope.targetType = "f.conversation.chat";
	$scope.feed = "groups";
  
  $scope.enableChat = false;
  $scope.enableFileShare = false;
  $scope.enableTextInput = false;
	$scope.messages = [];

	$scope.tabs = [{upper: $scope.verbage.chat, lower: 'chat', idx: 0}, 
	{upper: $scope.verbage.members, lower: 'members', idx: 1}, 
	{upper: $scope.verbage.voicemail, lower: 'voicemails', idx: 2}, 
	{upper: $scope.verbage.page, lower: 'page', idx: 3}, 
	{upper: $scope.verbage.recordings, lower: 'recordings', idx: 4},
  {upper: $scope.verbage.group_info, lower: 'info', idx: 5}
  ];
	
	// store recent
	storageService.saveRecent('group', $scope.groupID);

  $scope.chatTabEnabled;
  if ($scope.isMine){
    $scope.enableChat = true;
    $scope.enableTextInput = true;
    $scope.enableFileShare = true;
    $scope.chatTabEnabled = true;
  } else {
    $scope.enableChat = false;
    $scope.enableTextInput = false;
    $scope.enableFileShare = false;
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

  if ($routeParams.route != undefined){
    $scope.selected = $routeParams.route;
    localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
    for (var i = 0; i < $scope.tabs.length; i++){
      if ($scope.tabs[i].lower == $routeParams.route){
        $scope.toggleObject = $scope.tabs[i].idx;
        localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
        break;
      }
    } 
  } else {
    $scope.selected = localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid]) : $scope.isMine ? 'chat' : 'members';
    $scope.toggleObject = localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid]) : $scope.isMine ? 0 : 1;
  }

  // save user's last selected tab to LS
  $scope.saveGTab = function(tab, index){
      $scope.selected = tab;
      $scope.toggleObject = index;
      localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
      localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
  }; 

	
	$scope.deptHeaderDisplay = function(groupType){
		if (groupType === 0){
			return true;
		}
	};

	$scope.nonVisibleTeamHeaderDisplay = function(groupType){
		if (groupType !== 0 && groupType === 2)
			return true;
	};

	$scope.publicTeamHeaderDisplay = function(groupType){
		if (groupType !== 0 && groupType === 4)
			return true;
	};
  
  $scope.$on("$destroy", function() {

  });
}]);