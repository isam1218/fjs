hudweb.controller('QueueWidgetAgentsController', ['$scope', '$rootScope', 'QueueService', 'HttpService', 'StorageService', '$routeParams', function ($scope, $rootScope, queueService, httpService, storageService, $routeParams) {
  $scope.que = {};
  $scope.que.query = '';
  $scope.query = "";
  $scope.agents = [];
  $scope.myself = $rootScope.myPid;
  var queueId = $scope.$parent.$parent.queueId;
  
  $scope.statusFilter = function(status){
  return function(agent) {
    if (status == 'in') {
      if (agent.status && agent.status.status.indexOf('login') != -1)
        return true;
    }
    else {
      if (agent.status && agent.status.status.indexOf('login') == -1)
        return true;
    }
  };
  };

  $scope.selectedSort = localStorage['Queue_' + $routeParams.queueId + '_agent_sort_of_' + $rootScope.myPid] ? JSON.parse(localStorage['Queue_' + $routeParams.queueId + '_agent_sort_of_' + $rootScope.myPid]) : 'displayName';

  $scope.customAgentOrderBy = function(member){
    localStorage['Queue_' + $routeParams.queueId + '_agent_sort_of_' + $rootScope.myPid] = JSON.stringify($scope.selectedSort);     
    switch($scope.selectedSort){
      case 'displayName':
        return member.displayName;
      case 'queue_status':
        return [!member.fullProfile.call, member.displayName];
      case 'hud_status':
        return [member.fullProfile.hud_status, member.displayName];
    }
  }


  queueService.getQueues().then(function() {  
     $scope.agents = $scope.queue.members;
  });
  
  // refresh list
  $scope.$on('queue_members_status_synced', function() {
     $scope.agents = $scope.queue.members;
  });

  $scope.searchFilter = function(){
    var query = $scope.que.query.toLowerCase();
    return function(member){
      if (query == '' || member.displayName.toLowerCase().indexOf(query) != -1 || member.fullProfile.primaryExtension.indexOf(query) != -1)
        return true;
    };
  };

  $scope.callExtension = function($event, contact) {
    $event.stopPropagation();
    $event.preventDefault();
    
	httpService.sendAction('me', 'callTo', {phoneNumber: contact.primaryExtension});
	
	storageService.saveRecent('contact', contact.xpid);
  };
  
  $scope.showCallStatus = function($event, contact) {
    $event.stopPropagation();
        $event.preventDefault();
    
    // permission?
    if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
      return;
  
    $scope.showOverlay(true, 'CallStatusOverlay', contact);
  };

  $scope.$on("$destroy", function () {

  });

}]);
