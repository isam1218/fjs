hudweb.controller('GroupSingleMembersController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'StorageService', 
	function($scope, $rootScope, $routeParams, groupService, contactService, httpService, storageService) {
	$scope.groupId = $routeParams.groupId;
	$scope.group = groupService.getGroup($scope.groupId);
	$scope.members = $scope.group.members;
	$scope.grp = {};
	$scope.grp.query = '';
	$scope.query = "";
  $scope.myself = $rootScope.myPid;

  $scope.selectedSort = localStorage['Group_' + $routeParams.groupId + '_member_sort_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Group_' + $routeParams.groupId + '_member_sort_of_' + $rootScope.myPid]) : 'displayName';

  $scope.customMemberOrderBy = function(member){
    localStorage['Group_' + $routeParams.groupId + '_member_sort_of_' + $rootScope.myPid] = JSON.stringify($scope.selectedSort);
    switch($scope.selectedSort){
      case 'displayName':
        return member.fullProfile.displayName;
      case 'fullProfile.call':
        return [!member.fullProfile.call, member.fullProfile.displayName];
      case 'fullProfile.hud_status':
        return [member.fullProfile.hud_status, member.fullProfile.displayName];
    }
  }

  $scope.callExtension = function($event, contact){
    $event.stopPropagation();
    $event.preventDefault();
	
	   httpService.sendAction('me', 'callTo', {phoneNumber: contact.primaryExtension});
	
	   storageService.saveRecent('contact', contact.xpid);
  };
  
  $scope.showCallStatus = function($event, contact) {
    $event.stopPropagation();
        $event.preventDefault();
    
    // permission?
    if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid || contact.xpid == $rootScope.myPid)
      return;
  
    $scope.showOverlay(true, 'CallStatusOverlay', contact);
  };

  $scope.searchFilter = function(){
    var query = $scope.grp.query.toLowerCase();
    return function(member){
      if (member.fullProfile.displayName.toLowerCase().indexOf(query) != -1 || member.fullProfile.primaryExtension.indexOf(query) != -1)
        return true;
    };
  };
}]);