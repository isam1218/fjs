hudweb.controller('QueueWidgetAgentsController', ['$scope', '$rootScope', 'ContactService', 'HttpService', function ($scope, $rootScope, contactService, httpService) {
  var addedPid;
  $scope.que = {};
  $scope.que.query = '';
  $scope.query = "";
  $scope.selectedSort = "displayName";

  httpService.getFeed('queues');
  httpService.getFeed('queue_stat_calls');

  $scope.$on('pidAdded', function(event, data){
    addedPid = data.info;
    if (localStorage['recents_of_' + addedPid] === undefined){
      localStorage['recents_of_' + addedPid] = '{}';
    }
    $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
  });

  $scope.storeRecentQueueMember = function(xpid){
    var localPid = JSON.parse(localStorage.me);
    $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
    $scope.recent[xpid] = {
      type: 'contact',
      time: new Date().getTime()
    };
    localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
    $rootScope.$broadcast('recentAdded', {info: xpid});
  };

  $scope.$on('queues_updated', function (event, data) {
    $scope.loggedInMembers = [];
    $scope.loggedOutMembers = [];
	
	if ($scope.queue && $scope.queue.members && $scope.queue.members[0].status) {
		for (var i = 0; i < $scope.queue.members.length; i++) {
			var member = $scope.queue.members[i];
			
			if (member.status.status.indexOf('login') != -1)
				$scope.loggedInMembers.push(contactService.getContact(member.contactId));
			else
				$scope.loggedOutMembers.push(contactService.getContact(member.contactId));
		}
	}
  });

  $scope.searchFilter = function(){
    var query = $scope.que.query;
    return function(member){
      if (member.displayName.toLowerCase().indexOf(query) != -1 || member.primaryExtension.indexOf(query) != -1)
        return true;
    };
  };

  $scope.$on("$destroy", function () {

  });

}]);
