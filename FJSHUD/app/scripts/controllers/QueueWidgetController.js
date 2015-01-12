fjs.core.namespace("fjs.ui");

fjs.ui.QueueWidgetController = function($scope, $routeParams, $timeout, $filter, dataManager) {
    fjs.ui.Controller.call(this,  $scope, $routeParams, dataManager);

  $scope.context = this;
  $scope.dataManager = dataManager;
  $scope.queueId = $routeParams.queueId;

  $scope.contacts = dataManager.getModel('contacts').items;

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Agents';

  $scope.queueMembersModel = dataManager.getModel("queue_members");
  $scope.loggedInMembers = [];
  $scope.loggedOutMembers = [];


  $scope.queueMembersModel.addEventListener('complete', function (data) {

      $scope.$safeApply();
  });

  $scope.queueMembersModel.addEventListener("push", function (data) {
    if (data.entry.queueId === $scope.queueId) {
      var member = data.entry;

      member.contact = $scope.contacts[member.contactId];

      if (member.contact.getQueueStatus() === 'LoggedIn') {
        $scope.loggedInMembers.push(member);
      } else {
        $scope.loggedOutMembers.push(member);
      }
    }
    $scope.$safeApply();
  });

};
fjs.core.inherits(fjs.ui.QueueWidgetController, fjs.ui.Controller)

