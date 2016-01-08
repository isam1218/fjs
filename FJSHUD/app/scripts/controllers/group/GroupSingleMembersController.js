hudweb.controller('GroupSingleMembersController', ['$q', '$scope', '$rootScope', '$routeParams', 'GroupService', 'ContactService', 'HttpService', 'StorageService', 
	function($q, $scope, $rootScope, $routeParams, groupService, contactService, httpService, storageService) {		
	$scope.grp = {};
	$scope.grp.query = '';
	$scope.query = "";
	$scope.members = $rootScope.members;
    $scope.myself = $rootScope.myPid;

  $scope.sort_options = [
  {name:$scope.verbage.sort_by_name, id:1,type:'fullProfile.displayName'},
    {name:$scope.verbage.sort_by_call_status,id:2, type:'fullProfile.call'},
    {name:$scope.verbage.sort_by_chat_status,id:3, type:'fullProfile.hud_status'},
  ];
  
  $scope.selectedSort = $scope.sort_options[0];  
 
  $scope.callExtension = function($event, contact){
    $event.stopPropagation();
    $event.preventDefault();
	
	   httpService.sendAction('me', 'callTo', {phoneNumber: contact.extension});
	
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
      if (member.username.toLowerCase().indexOf(query) != -1 || member.extension.indexOf(query) != -1)
        return true;
    };
  };
}]);