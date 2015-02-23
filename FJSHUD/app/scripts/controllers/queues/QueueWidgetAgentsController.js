hudweb.controller('QueueWidgetAgentsController', ['$scope', '$rootScope', '$routeParams', 'HttpService', function ($scope, $rootScope, $routeParams, myHttpService) {
  $scope.queueId = $routeParams.queueId;
  $scope.query = "";

  $scope.contacts = [];
  $scope.queueMembers = [];

  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');
  myHttpService.getFeed('contacts');
  myHttpService.getFeed('contacts_synced');

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Agents';

  $scope.sort_options = [
    {display_name: "Name", type: "name"},
    {display_name: "Call Status", type: "callStatus"},
    {display_name: "Chat Status", type: "chatStatus"}
  ];
  $scope.selectedSort = $scope.sort_options[0];

  $scope.sortBy = function (type) {
    switch (type) {
      case "name":
        $scope.queues.sort(function (a, b) {
          return a.name.localeCompare(b.Name);
        });
        break;
      case "callStatus":
        $scope.queues.sort(function (a, b) {
          return b.info.waiting - a.info.waiting;
        });
        break;
      case "chatStatus":
        $scope.queues.sort(function (a, b) {
          return a.info.waiting - b.info.waiting;
        });
        break;
    }
  };

  $scope.$on('contacts_synced', function (event, data) {
    for (key in data) {
      var contact = data[key];

      $scope.contacts[contact.xpid] = contact;
    }
    $rootScope.loaded = true;
    $scope.$apply();
  });

  $scope.$on('contactstatus_synced', function (event, data) {
    for (key in data) {
      for (c in $scope.contacts) {
        // set contact's status
        if ($scope.contacts[c].xpid == data[key].xpid) {
          $scope.contacts[c].hud_status = data[key].xmpp;
          break;
        }
      }
    }
  });

  $scope.$on('calls_synced', function (event, data) {
    for (key in data) {
      for (c in $scope.contacts) {
        // set contact's status
        if ($scope.contacts[c].xpid == data[key].xpid) {
          $scope.contacts[c].calls_startedAt = data[key].startedAt;
          break;
        }
      }
    }
  });

  $scope.$on('queues_synced', function (event, data) {
    if (data.queues !== undefined) {
      var queues = data.queues;
      for (i = 0; i < queues.length && $scope.queue === undefined; i++) {
        if (queues[i].xpid == $scope.queueId) {
          $scope.queue = queues[i];
        }

      }
      $scope.$safeApply();
    }
  });

  $scope.$on('queues_updated', function (event, data) {
    $scope.loggedInMembers = [];
    $scope.loggedOutMembers = [];

    for (var i = 0; i < $scope.queue.members.length; i++) {
      var member = $scope.queue.members[i];

      member.contact = $scope.contacts[member.contactId];

      if (member.status !== undefined) {
        if (member.status.status == 'login') {
          member.displayStatus = "Logged in"
          $scope.loggedInMembers.push(member);
        } else {
          member.displayStatus = "Logged out"
          $scope.loggedOutMembers.push(member);
        }
      }
    }
  });

  $scope.getAvatarUrl = function (xpid) {
    if (xpid !== undefined) {
      return myHttpService.get_avatar(xpid, 32, 32);
    }
    else
      return 'img/Generic-Avatar-32.png';
  };


  $scope.$on("$destroy", function () {

  });

}]);
