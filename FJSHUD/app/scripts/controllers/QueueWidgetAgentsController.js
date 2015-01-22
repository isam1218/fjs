//fjs.core.namespace("fjs.ui");
//
//fjs.ui.QueueWidgetController = function($scope, $routeParams, $timeout, $filter, dataManager) {
//    fjs.ui.Controller.call(this,  $scope, $routeParams, dataManager);
//
//  $scope.context = this;
//  $scope.dataManager = dataManager;
//  $scope.queueId = $routeParams.queueId;
//
//  $scope.contacts = dataManager.getModel('contacts').items;
//
//  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
//  $scope.selected = 'Agents';
//
//  $scope.queueMembersModel = dataManager.getModel("queue_members");
//  $scope.loggedInMembers = [];
//  $scope.loggedOutMembers = [];
//
//
//  $scope.queueMembersModel.addEventListener('complete', function (data) {
//
//      $scope.$safeApply();
//  });
//
//  $scope.queueMembersModel.addEventListener("push", function (data) {
//    if (data.entry.queueId === $scope.queueId) {
//      var member = data.entry;
//
//      member.contact = $scope.contacts[member.contactId];
//
//      if (member.contact.getQueueStatus() === 'LoggedIn') {
//        $scope.loggedInMembers.push(member);
//      } else {
//        $scope.loggedOutMembers.push(member);
//      }
//    }
//    $scope.$safeApply();
//  });
//
//};
//fjs.core.inherits(fjs.ui.QueueWidgetController, fjs.ui.Controller)
//


fjs.ui.QueueWidgetAgentsController = function ($scope, $rootScope, $routeParams, myHttpService) {
  $scope.queueId = $routeParams.queueId;
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.contacts = [];
  $scope.queueMembers = [];
  $scope.add = {};
  $scope.recents = localStorage.recents ? JSON.parse(localStorage.recents) : {};

  if (!$scope.loggedInQueueMembers) {
    $scope.loggedInQueueMembers = [];
    $scope.loggedInMembers = [];
    $scope.loggedOutMembers = [];
  } else {
    //   $scope.loggedInMembers = $scope.loggedInQueueMembers[$scope.queueId];
  }

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Agents';

  $scope.sort = function (field) {
    if ($scope.sortField != field) {
      $scope.sortField = field;
      $scope.sortReverse = false;
    }
    else {
      $scope.sortReverse = !$scope.sortReverse;
    }
  };

  // filter contacts down
  $scope.customFilter = function () {
    var tab = $scope.$parent.tab;

    return function (contact) {
      // remove self
      if (contact.xpid != $rootScope.myPid) {
        // filter by tab
        switch (tab) {
          case 'all':
            return true;
            break;
          case 'external':
            if (contact.primaryExtension == '')
              return true;
            break;
          case 'recent':
            if ($scope.recents[contact.xpid] !== undefined) {
              // attach timestamp to sort by
              contact.timestamp = $scope.recents[contact.xpid];
              return true;
            }
            break;
          case 'favorites':
            break;
        }
      }
    };
  };

  $scope.customSort = function () {
    // recent list doesn't have a sort field
    if ($scope.$parent.tab == 'recent')
      return 'timestamp';
    else
      return $scope.sortField;
  };

  $scope.customReverse = function () {
    // recent list is always reversed
    if ($scope.$parent.tab == 'recent')
      return true;
    else
      return $scope.sortReverse;
  };

  // record most recent contacts
  $scope.storeRecent = function (xpid) {
    $scope.recents[xpid] = new Date().getTime();
    localStorage.recents = JSON.stringify($scope.recents);
  };

  $scope.addContact = function () {
    // validate
    if (!$scope.add.firstName && !$scope.add.lastName) {
      $scope.addError = 'Contact name is not specified.';
      return;
    }
    else if ($scope.add.email && $scope.add.email.indexOf('@') == -1) {
      $scope.addError = 'E-mail is incorrect.';
      return;
    }

    // save
    myHttpService.sendAction('contacts', 'addContact', $scope.add);
    $scope.$parent.showOverlay(false);
    $scope.add = {};
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

  $scope.$on('queue_members_synced', function (event, data) {
    for (key in data) {
      var member = data[key];

      if ($scope.contacts.hasOwnProperty(member.contactId)) {
        member.contact = $scope.contacts[member.contactId];
      }

      if (!$scope.queueMembers.hasOwnProperty(member.queueId)) {
        $scope.queueMembers[member.queueId] = [];
      }
      $scope.queueMembers[member.queueId].push(member);

      if (!$scope.loggedInQueueMembers.hasOwnProperty(member.queueId)) {
        $scope.loggedInQueueMembers[member.queueId] = [];
      }
      // need to check queue status
      $scope.loggedInQueueMembers[member.queueId].push(member);
    }
    $scope.loggedInMembers = $scope.loggedInQueueMembers[$scope.queueId];
  });

  //$scope.getAvatarUrl = function (xpid) {
  //  return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + xpid + "&w=28&h=28&Authorization=" + dataManager.api.ticket + "&node=" + dataManager.api.node;
  //};

  $scope.getAvatarUrl = function (xpid) {
    if (xpid !== undefined) {
      return fjs.CONFIG.SERVER.serverURL + "/v1/contact_image?pid=" + xpid + "&w=14&h=14&Authorization=" + $scope.dataManager.api.ticket + "&node=" + $scope.dataManager.api.node;
    }
    else
      return 'img/Generic-Avatar-14.png';
  };


  $scope.$on("$destroy", function () {

  });

  $scope.addQueueMember = function () {

    $scope.add = {};
  };
  // myHttpService.sendAction('queue_members', 'addQueueMember', $scope.add);

};
