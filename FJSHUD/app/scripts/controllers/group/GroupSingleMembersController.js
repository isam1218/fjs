hudweb.controller('GroupSingleMembersController', ['$scope', '$rootScope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'StorageService', 'CallStatusService', 'PhoneService',
	function($scope, $rootScope, $routeParams, groupService, contactService, httpService, storageService, callStatusService, phoneService) {
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
     phoneService.holdCalls();
	   httpService.sendAction('me', 'callTo', {phoneNumber: contact.primaryExtension});
  };

  $scope.showCallStatus = function($event, contact) {
    $event.stopPropagation();
    $event.preventDefault();
    //if user doesn't have permission to view call show overlay else if its a conference call route to the conference room.
    if(contact.call.displayName == "Private"){
      $scope.showOverlay(true, 'CallStatusOverlay', contact);
    }
    else if(contact.call.details.conferenceId != undefined){
    $location.path("/conference/" + contact.call.details.conferenceId + "/currentcall");
    }
    // if this service-function returns true -> it's a trap! User is trying to click on own cso so do not show
    if (callStatusService.blockOverlay(contact)){
      return;
    } else {
      // if user isn't clicking on own -> then show overlay
      $scope.showOverlay(true, 'CallStatusOverlay', contact);
    }
  };

  $scope.searchFilter = function(){
    var query = $scope.grp.query.toLowerCase();
    return function(member){
      if (member.fullProfile.displayName.toLowerCase().indexOf(query) != -1 || member.fullProfile.primaryExtension.indexOf(query) != -1)
        return true;
    };
  };
}]);