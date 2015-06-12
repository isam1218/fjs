hudweb.controller('GroupSingleController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'GroupService', 'SettingsService', 'StorageService', function($scope, $rootScope, $routeParams, myHttpService, groupService, settingsService, storageService) {
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

	$scope.tabs = [{upper: $scope.verbage.chat, lower: 'chat'}, 
	{upper: $scope.verbage.members, lower: 'members'}, 
	{upper: $scope.verbage.voicemail, lower: 'voicemails'}, 
	{upper: $scope.verbage.page, lower: 'page'}, 
	{upper: $scope.verbage.recordings, lower: 'recordings'},
  {upper: $scope.verbage.group_info, lower: 'info'}
  ];
	
	// store recent
	storageService.saveRecent('group', $scope.groupID);

  if ($routeParams.route != undefined){
    $scope.selected = $routeParams.route;
    localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
    for (var i = 0; i < $scope.tabs.length; i++){
      if ($scope.tabs[i].lower == $routeParams.route){
        $scope.toggleObject = {item: i};
        localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
        break;
      }
    } 
  } else {
    $scope.selected = localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid]) : $scope.isMine ? $scope.tabs[0].lower : $scope.tabs[1].lower;
    $scope.toggleObject = localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid]) : {item: 0};      
  }

  // save user's last selected tab to LS
  $scope.saveGTab = function(tab, index){
      $scope.selected = tab;
      $scope.toggleObject.item = index;
      localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
      localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
  }; 

  var recordingPerm;
  settingsService.getPermissions().then(function(data){
    recordingPerm = data.showCallCenter;
  });

  // filters out the display of certain group tabs per user's permissions
	$scope.tabFilter = function(){
		return function(tab){
      switch(tab.lower){
        case "chat":
          $scope.isMine = groupService.isMine($scope.groupID);
          if ($scope.isMine){
            $scope.enableChat = true;
            $scope.enableTextInput = true;
            $scope.enableFileShare = true;
            return true;
          } else {
            $scope.enableChat = false;
            $scope.enableTextInput = false;
            $scope.enableFileShare = false;
            return false;
          }
          break;
        case "voicemails":
          return true;
          break;
        case "info":
          if ($scope.group.type !== 0){
            return true;
          }
          else {
            return false;
          }
          break;
        case "page":
          if ($scope.group.type === 0)
            return true;
          else 
            return false;
          break;
        case "recordings":
          if (recordingPerm)
            return true;
          else
            return false;
          break;
      }
      return true;
		};
	};
	
	$scope.deptHeaderDisplay = function(groupType){
		if (groupType === 0){
			return true;
		}
	};

	$scope.nonVisibleTeamHeaderDisplay = function(groupType){
		if (groupType !== 0 && groupType === 2)
			return true;
	}

	$scope.publicTeamHeaderDisplay = function(groupType){
		if (groupType !== 0 && groupType === 4)
			return true;
	};

	// display avatar for group member
  $scope.getAvatarUrl = function(index) {
		if ($scope.group && $scope.group.members) {
			if ($scope.group.members[index] !== undefined) {
				var xpid = $scope.group.members[index].contactId;
				return myHttpService.get_avatar(xpid, 28, 28);
			}
			else
				return 'img/Generic-Avatar-28.png';

		}
  };

  
  $scope.$on("$destroy", function() {

  });
}]);