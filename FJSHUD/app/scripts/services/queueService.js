hudweb.service('QueueService', ['$rootScope', '$q', 'HttpService', function ($rootScope, $q, httpService) {
  var queues = [];

  this.getQueues = function () {
    return queues;
  };

  var formatData = function () {
    // format data that controller needs
    return {
      queues: queues
    };
  };

  $rootScope.$on("queues_synced", function (event, data) {
    if (queues.length < 1) {
      queues = data;

      // pull feed again in case shared worker got ahead of us
      httpService.getFeed('queue_members');

      // add avatar function
      for (i = 0; i < queues.length; i++) {
        queues[i].getAvatar = function (index, size) {
          if (this.members) {
            if (this.members[index] !== undefined) {
              var xpid = this.members[index].contactId;
              return httpService.get_avatar(xpid, size, size);
            }
            else
              return 'img/Generic-Avatar-' + size + '.png';
          }
        };
      }
    }

    $rootScope.$broadcast('queues_updated', formatData());
  });

  $rootScope.$on("queue_members_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {
      queues[i].members = [];
      for (key in data) {
        if (data[key].queueId == queues[i].xpid) {
          queues[i].members.push(data[key]);
        }
      }
    }
    $rootScope.$broadcast('queues_updated', formatData());
  });

  $rootScope.$on("queue_members_status_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {

      if (queues[i].members && queues[i].members.length > 0) {
        for (j = 0; j < queues[i].members.length; j++) {
          for (key in data) {
            if (data[key].xpid == queues[i].members[j].xpid) {
              queues[i].members[j].status = data[key];
            }
          }
        }
      }
    }

    $rootScope.$broadcast('queues_updated', formatData());
  });

  $rootScope.$on("queue_stat_calls_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {
      for (key in data) {
        if (data[key].xpid == queues[i].xpid) {
          queues[i].info = data[key];
        }
      }
    }
    $rootScope.$broadcast('queues_updated', formatData());
  });

  $rootScope.$on("queuemembercalls_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {
      for (key in data) {
        if (data[key].xpid == queues[i].xpid) {
          queues[i].callLogs = data[key];
        }
      }
    }
    $rootScope.$broadcast('queues_updated', formatData());
  });



}]);
