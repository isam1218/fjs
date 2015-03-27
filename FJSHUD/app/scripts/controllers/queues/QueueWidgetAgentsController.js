hudweb.controller('QueueWidgetAgentsController', ['$scope', 'ContactService', 'HttpService', function ($scope, contactService, httpService) {
  $scope.query = "";
  $scope.selectedSort = "displayName";

  httpService.getFeed('queues');
  httpService.getFeed('queue_members');
  httpService.getFeed('queue_members_status');
  httpService.getFeed('queue_stat_calls');
  httpService.getFeed('contacts');
  httpService.getFeed('contacts_synced');

  $scope.$on('queues_updated', function (event, data) {
    $scope.loggedInMembers = [];
    $scope.loggedOutMembers = [];
	
	if ($scope.queue && $scope.queue.members) {
		for (var i = 0; i < $scope.queue.members.length; i++) {
			var member = $scope.queue.members[i];
			
			if (member.status.status.indexOf('login') != -1)
				$scope.loggedInMembers.push(contactService.getContact(member.contactId));
			else
				$scope.loggedOutMembers.push(contactService.getContact(member.contactId));
		}
	}
  });

  $scope.$on("$destroy", function () {

  });

}]);
