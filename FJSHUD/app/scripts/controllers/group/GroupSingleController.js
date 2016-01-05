hudweb.controller('GroupSingleController', ['$q', '$scope', '$rootScope', '$routeParams', 'GroupService', 'SettingsService', 'StorageService', '$location', function($q, $scope, $rootScope, $routeParams, groupService, settingsService, storageService, $location) {
	
	$scope.groupId = $routeParams.groupId;	
	
	//$scope.isMine = groupService.isMine($scope.groupId);
	//$scope.isMine = false;
	$scope.targetId = $scope.groupId;
	$scope.conversationType = 'group';
	$scope.targetAudience = "group";
	$scope.targetType = "f.conversation.chat";
	$scope.feed = "groups";
  
	$scope.messages = [];

	$scope.tabs = [{upper: $scope.verbage.chat, lower: 'chat', idx: 0}, 
	{upper: $scope.verbage.members, lower: 'members', idx: 1}, 
	{upper: $scope.verbage.voicemail, lower: 'voicemails', idx: 2}, 
	{upper: $scope.verbage.page, lower: 'page', idx: 3}, 
	{upper: $scope.verbage.recordings, lower: 'recordings', idx: 4},
  {upper: $scope.verbage.group_info, lower: 'info', idx: 5}
  ];  
   
	$scope.my_id = $rootScope.meModel.my_pid;//.split('_')[1];
	var my_id = $rootScope.meModel.my_pid;
	var contactId = $routeParams.contactId;	
	var server_id = $rootScope.meModel.server_id;
	
  // store recent
  storageService.saveRecent('group', $scope.groupId);

  $scope.chatTabEnabled;  
  $scope.recordingPerm;
  $scope.isMine;
  
  settingsService.getPermissions().then(function(data){
    $scope.recordingPerm = data.showCallCenter;
  });

  $scope.infoTab = false;
  $scope.pageTab = false;
  //if ($scope.group.type != 0){
    $scope.infoTab = true;
 // } else {
   // $scope.pageTab = true;
 // }
	
	$scope.getCurGroup = function()
	{
		var myObj = {};
		var body = {};
		var d = new Date();	
		//settingsService.getMe().then(function(data) {
			var current_user = settingsService.getMe().$$state.value;
			var my_id = current_user.my_pid;//.split('_')[1];		
			var server_id = current_user.server_id;					
			
		    myObj.reqType = "data/getUsersInGroup";						
			myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815		
			body.groupType = "group";
			body.groupId = $routeParams.groupId;
			body.serverId = server_id;		
			
			myObj.body = JSON.stringify(body);
			var json = JSON.stringify(myObj);	
			if($scope.sock == null)
				$scope.sock = new WebSocket($scope.wsuri);	
			if($scope.sock != null)
				$scope.sock.send(json);	
		//});	
		
	};
	
	var callSingleEmit = function(){		
	};
	
	settingsService.getMe().then(function(data) {
		if($routeParams.groupId)
		{	
			var singlePromise = $q(function(resolve, reject) {
				  $scope.getCurGroup();
			}).then(callSingleEmit);
		}
	});	
	/*groupService.getSingleGroup = function()
	{     	    											
		settingsService.getMe().then(function(data) {  
		  var singlePromise = $q(function(resolve, reject) {
			  $scope.getCurGroup();
		  }).then(callSingleEmit);
		});		 				  		
	};  */			
   groupService.getGroup().then(function(data) {
		//$scope.group =  data;
	   $scope.isMine = false;
		var contactsLength = $scope.contactList.length;
		var dataLength = data.length;
		
		for(l = 0; l < dataLength; l++)
		{	
			var contactId = data[l];
			for(var n = 0; n < contactsLength; n++)
			{
				if($scope.contactList[n].id ==  contactId)
				{	
					$scope.members.push($scope.contactList[n]);	
					if(contactId == $rootScope.myPid)
						$scope.isMine = true;
				}
			}
		}	
		
		//if current user in the group, show the chat tab
		if ($scope.isMine){
		    $scope.chatTabEnabled = true;
		} else {
		    $scope.chatTabEnabled = false;
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
   });
  // save user's last selected tab to LS
  $scope.saveGTab = function(tab, index){
      $scope.toggleObject = index;
      localStorage['GroupSingle_' + $routeParams.groupId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify(tab);
      localStorage['GroupSingle_' + $routeParams.groupId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
  }; 
  
  $scope.$on("$destroy", function() {

  });    
}]);