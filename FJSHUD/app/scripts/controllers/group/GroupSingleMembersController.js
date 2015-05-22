hudweb.controller('GroupSingleMembersController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'ContactService', 'HttpService','PhoneService', 
	function($scope, $rootScope, $routeParams, groupService, contactService, httpService,phoneService) {
	var addedPid;
	$scope.groupId = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupId);
	$scope.members = $scope.group.members;
	$scope.grp = {};
	$scope.grp.query = '';
	$scope.query = "";

	$scope.sort_options = [
	{name:$scope.verbage.sort_by_name, id:1,type:'name'},
    {name:$scope.verbage.sort_by_call_status,id:2, type:'call_status'},
    {name:$scope.verbage.sort_by_chat_status,id:3, type:'chat_status'},
  ];
  
  $scope.selectedSort = $scope.sort_options[0];

  $scope.$on('pidAdded', function(event, data){
  	addedPid = data.info;
  	if (localStorage['recents_of_' + addedPid] === undefined){
  		localStorage['recents_of_' + addedPid] = '{}';
  	}
  	$scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.storeRecentContact = function(xpid){
		var localPid = JSON.parse(localStorage.me);
		$scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
		// $scope.recent = JSON.parse(localStorage.recent);		
		$scope.recent[xpid] = {
			type: 'contact',
			time:  new Date().getTime()
		};
		localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
		// localStorage.recent = JSON.stringify($scope.recent);
		$rootScope.$broadcast('recentAdded', {id: xpid, type: 'contact', time: new Date().getTime()});
  };

	$scope.callExtension= function(extension){
		phoneService.makeCall(extension);
	};

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

	$scope.searchFilter = function(){
		var query = $scope.grp.query;
		return function(member){
			if (member.fullProfile.displayName.toLowerCase().indexOf(query) != -1 || member.fullProfile.primaryExtension.indexOf(query) != -1)
				return true;
		};
	}
}]);