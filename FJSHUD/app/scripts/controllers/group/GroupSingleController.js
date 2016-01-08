hudweb.controller('GroupSingleController', ['$q', '$scope', '$rootScope', '$routeParams', '$timeout', 'GroupService', 'SettingsService', 'StorageService', '$location', function($q, $scope, $rootScope, $routeParams, $timeout, groupService, settingsService, storageService, $location) {
	
	$scope.groupId = $routeParams.groupId;	
	
	//$scope.isMine = groupService.isMine($scope.groupId);
	//$scope.isMine = false;
	$scope.groups = $rootScope.groups;
	$scope.targetId = $scope.groupId;
	$scope.conversationType = 'group';
	$scope.targetAudience = "group";
	$scope.targetType = "f.conversation.chat";
	$scope.feed = "groups";
	$rootScope.members = []; 
	$scope.messages = [];
	$scope.group  = {};
	$scope.isMine = $rootScope.myGroup ? true : false;

	$scope.tabs = [{upper: $scope.verbage.chat, lower: 'chat', idx: 0}, 
	{upper: $scope.verbage.members, lower: 'members', idx: 1}, 
	{upper: $scope.verbage.voicemail, lower: 'voicemails', idx: 2}, 
	{upper: $scope.verbage.page, lower: 'page', idx: 3}, 
	{upper: $scope.verbage.recordings, lower: 'recordings', idx: 4},
  {upper: $scope.verbage.group_info, lower: 'info', idx: 5}
  ];  
   	
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
 var current_user = settingsService.getMe().$$state.value;     
 
 $scope.getCurGroup = function()
 {
	var myObj = {};
	var body = {};
	var d = new Date();			
	
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
	//$timeout(function(){
		$scope.sock.send(json);			
	//}, 500, false);		
 };	

 if($routeParams.groupId && current_user)
 {
	settingsService.getMe().then(function(data) {
			
			var singlePromise = $q(function(resolve, reject) {
				  $scope.getCurGroup();
			}).then(function(){});
		
	});	
 }

 groupService.getGroup().then(function(data) {		
   $scope.isMine = false;		
   var dataLength = data.length;
   var groupsLength = $rootScope.groups.length;
   
   //add the members to the current group
   for(var n = 0; n < groupsLength; n++)
   {
	   if($rootScope.groups[n].id == $routeParams.groupId)
	   {
		   $rootScope.groups[n].members = data;
		   $scope.group = $rootScope.groups[n];
		   
		   for(l = 0; l < dataLength; l++)
		   {	
				var contactId = $rootScope.groups[n].members[l].id;
				if(contactId == $rootScope.myPid)
				{	
				  $scope.isMine = true;
				  break;
				}  
				
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
   $rootScope.$emit('isMine', {"isMine": $scope.isMine});
   $scope.$safeApply();
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