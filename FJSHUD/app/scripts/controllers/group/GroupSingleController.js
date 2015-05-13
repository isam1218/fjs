hudweb.controller('GroupSingleController', ['$scope', '$rootScope', '$routeParams', 'HttpService', 'GroupService', function($scope, $rootScope, $routeParams, myHttpService, groupService) {
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
	{upper: $scope.verbage.recordings, lower: 'recordings'}];

  var getXpidInG = $rootScope.$watch('myPid', function(newVal, oldVal){
      if (!$scope.globalXpid){
          $scope.globalXpid = newVal;
              $scope.selected = localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
              $scope.toggleObject = localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
              getXpidInG();
      } else {
          getXpidInG();
      }
  });

  $scope.$on('pidAdded', function(event, data){
      $scope.globalXpid = data.info;
      $scope.selected = localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
      $scope.toggleObject = localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  });

  $scope.saveGTab = function(tab, index){
      switch(tab){
          case "chat":
              $scope.selected = $scope.tabs[0].lower;
              localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "members":
              $scope.selected = $scope.tabs[1].lower;
              localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "voicemails":
              $scope.selected = $scope.tabs[2].lower;
              localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "page":
              $scope.selected = $scope.tabs[3].lower;
              localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
          case "recordings":
              $scope.selected = $scope.tabs[4].lower;
              localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
              $scope.toggleObject = {item: index};
              localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
              break;
      }
  }; 

	$scope.tabFilter = function(){
		return function(tab){
			if (tab.lower === 'chat'){
				// if not my group -> return false and filter out the chat tab
				$scope.isMine = groupService.isMine($scope.groupID);
				if ($scope.isMine){
					return true;
				} else {
					return false;
				}
			}
			return true;
		};
	};

	$scope.$on('groups_updated', function(event, data) {
		var groups = data.groups;

		// find this group
		for (i in groups) {
			if (groups[i].xpid == $scope.groupID) {
				$scope.group = groups[i];
				break;
			}
		}
		
		$scope.isMine = groupService.isMine($scope.groupID);
	});

	if ($scope.conversationType == 'group'){
		if ($scope.isMine){
			$scope.enableChat = true;
			$scope.enableTextInput = true;
			$scope.enableFileShare = true;
		} else {
			$scope.enableChat = false;
			$scope.enableTextInput = false;
			$scope.enableFileShare = false;
		}
	}
	

	$scope.selected = $routeParams.route ? $routeParams.route : $scope.tabs[0].lower;

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