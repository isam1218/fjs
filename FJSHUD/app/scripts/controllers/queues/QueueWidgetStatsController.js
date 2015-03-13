hudweb.controller('QueueWidgetStatsController', ['$scope', '$routeParams', 'HttpService', function ($scope, $routeParams, myHttpService) {
  $scope.queueId = $routeParams.queueId;

  $scope.contacts = [];
  $scope.queueMembers = [];

  myHttpService.getFeed('queues');
  myHttpService.getFeed('queue_members');
  myHttpService.getFeed('queue_members_status');
  myHttpService.getFeed('queue_stat_calls');
  myHttpService.getFeed('contacts');
  myHttpService.getFeed('contacts_synced');

  $scope.tabs = ['Agents', 'Stats', 'Calls', 'Call Log'];
  $scope.selected = 'Stats';
  $scope.isAscending = true;
  $scope.sortColumn = 'name';

  $scope.sortBy = function (type) {

    switch (type) {
      case "name":
        $scope.queueMembers.sort(function (a, b) {
          if ($scope.isAscending) {
            return a.displayName.localeCompare(b.displayName);
          } else {
            return b.displayName.localeCompare(a.displayName);
          }
        });
        break;
      case "talkIdle":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.waiting - b.info.waiting;
            } else {
              return b.info.waiting - a.info.waiting;
            }
          } else {
            return 0;
          }
        });

        break;
      case "calls":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgWait - b.info.avgWait;
            } else {
              return b.info.avgWait - a.info.avgWait;
            }
          } else {
            return 0;
          }
        });
        break;
      case "avgTalk":
        $scope.queueMembers.sort(function (a, b) {
          if (b && b.info && a && a.info) {
            if ($scope.isAscending) {
              return a.info.avgTalk - b.info.avgTalk;
            } else {
              return b.info.avgTalk - a.info.avgTalk;
            }
          } else {
            return 0;
          }
        });
        break;
    }
    if ($scope.sortColumn == type) {
      $scope.isAscending = !$scope.isAscending;
    }
    $scope.sortColumn = type;
  };

  $scope.$on('contacts_synced', function (event, data) {
    for (key in data) {
      var contact = data[key];

      $scope.contacts[contact.xpid] = contact;
    }
     $scope.$safeApply();
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

  $scope.$on('queues_updated', function (event, data) {
    $scope.queueMembers = [];

    for (var i = 0; i < $scope.queue.members.length; i++) {
      var member = $scope.queue.members[i];

      member.contact = $scope.contacts[member.contactId];
      member.otherQueues = [];
      $scope.queueMembers.push(member);
    }

    var queues = data.queues;
    for (var q in queues) {
      var queue = queues[q];

      // Don't include this queue
      if (queue.xpid === $scope.queue.xpid) {
        continue;
      }

      for (var m in $scope.queueMembers) {
        var member = $scope.queueMembers[m];

        for (var qm in queue.members) {
          var qMember = queue.members[qm];

          if (qMember.xpid === member.xpid) {
            member.otherQueues.push(queue);
          }
        }
      }
    }
  });

  $scope.$on("$destroy", function () {

  });  $scope.getAvatarUrl = function (xpid) {
    if (xpid !== undefined) {
      return myHttpService.get_avatar(xpid, 32, 32);
    }
    else
      return 'img/Generic-Avatar-32.png';
  };

  $scope.onTwistieClicked = function (e) {
    //   console.log('twistieClicked');
    var rowDiv = e.srcElement.parentElement.parentElement.parentElement;
    var className = rowDiv.className;
    var expanded = className.indexOf('ListLineExpanded') != -1;

    if (expanded) {

      if (this.$even) {
        className = 'ListRow ListLine';
      } else {
        className = 'ListRowOdd';
      }
    } else {
      className = 'ListRow ListLine ListLineExpanded';
    }

    rowDiv.className = className;
  }
}]);
