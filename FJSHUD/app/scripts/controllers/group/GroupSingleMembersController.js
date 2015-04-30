hudweb.controller('GroupSingleMembersController', ['$scope', '$routeParams', 'GroupService', 'ContactService', 'HttpService','PhoneService', 
	function($scope, $routeParams, groupService, contactService, httpService,phoneService) {
	$scope.groupId = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupId);
	$scope.members = [];
	$scope.query = "";
	httpService.getFeed("groupcontacts");
	httpService.getFeed("contactstatus");
	$scope.sort_options = [
	{name:$scope.verbage.sort_by_name, id:1,type:'name'},
    {name:$scope.verbage.sort_by_call_status,id:2, type:'call_status'},
    {name:$scope.verbage.sort_by_chat_status,id:3, type:'chat_status'},
    ];
    $scope.selectedSort = $scope.sort_options[0];

    $scope.getAvatar = function(xpid) {
		return httpService.get_avatar(xpid, 40, 40);
	};
	
	$scope.$on('groups_updated', function(event, data) {
			
		$scope.group = groupService.getGroup($scope.groupId);
		
		if($scope.group){
			$scope.members = $scope.group.members;
		}
		
		$scope.isMine = groupService.isMine($scope.groupId);		
	});

	$scope.callExtension= function(extension){
		phoneService.makeCall(extension);
	}
	$scope.$on("contacts_updated", function(event,data){
		for(index in $scope.members){
			for(key in data){
				if(data[key].xpid == $scope.members[index].xpid){
					$scope.members[index] = data[key];
					$scope.members[index].contactId = data[key].xpid;
					break;	
				}
			}
		}
	});

	$scope.sortBy = function(type){
		switch(type){
			case 'name':
				$scope.members.sort(function(a,b){
					b.displayName.localeCompare(a.displayName);
				});	
				break;
			case 'call_status':
				$scope.members.sort(function(a,b){
					if(b.queue_status == "login"){
						return 1;
					}else{
						return -1;
					}
				});	
				break;
			case 'chat_status':
				$scope.members.sort(function(a,b){
					if(b.hud_status == "available"){
						return 1;
					}else{
						return -1;
					}
				});
				break;
		}
		$scope.$safeApply();

	}
}]);