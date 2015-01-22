fjs.hud.queueService = function($q, $rootScope, myHttpService) {
  // required to deliver promises
  var deferred = $q.defer();

  var queues = [];
  var queueMembers = [];
  var queueStatCalls = [];
  var queueStatMembers = [];

  this.getQueues = function () {
    return deferred.promise;
  };

  $rootScope.$on('queues_synced', function(event, data) {
    if(data && data != undefined) {

      // initial sync
      if (queues.length < 1) {
        queues = data;
        deferred.resolve(queues);
        $rootScope.loaded = true;

        // add avatar to each contact
        for (var q in queues) {
          queues[q].getAvatar = function (size) {
            return myHttpService.get_avatar(this.xpid, size, size);
          };
        }
      }
      else {
        for (var i = 0; i < data.length; i++) {
          for (var q = 0; q < queues.length; q++) {
            // found queues
            if (queues[q].xpid == data[i].xpid) {
              // update or delete
              if (data[i].xef001type == 'delete')
                queues.splice(q, 1);
              else
                queues[q] = data[i];

              break;
            }

            // no match, so new record
            if (q == queues.length - 1)
              queues.push(data[i]);
          }
        }
      }
      $rootScope.$broadcast('queues_updated', queues);
      //   deferred.resolve(queues);
    }
  });

  $rootScope.$on('queue_members_synced', function(event, data) {
    queueMembers = data;
    for (var key in data) {
      for (var q in queueMembers) {
        if (queueMembers[q].xpid == data[key].xpid) {
          queueMembers[q].hud_status = data[key].xmpp;
          break;
        }
      }
    }

    //deferred.resolve(queueMembers);
  });

  $rootScope.$on('queue_stat_calls_synced', function(event, data) {
    queueStatCalls = data;
    for (var key in data) {
      for (var q in queueStatCalls) {
        // set queues status'
        if (queueStatCalls[q].xpid == data[key].xpid) {
          queueStatCalls[q].calls_startedAt = data[key].startedAt;
          break;
        }
      }
    }

    //deferred.resolve(queues);
  });

  $rootScope.$on('queue_stat_members_synced', function(event, data) {
    queueStatMembers = data;
    for (var key in data) {
      for (var q in queueStatMembers) {
        // set queues status'
        if (queueStatMembers[q].xpid == data[key].xpid) {
          queueStatMembers[q].calls_startedAt = data[key].startedAt;
          break;
        }
      }
    }

    //deferred.resolve(queues);
  });


};

