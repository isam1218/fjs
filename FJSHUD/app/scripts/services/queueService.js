hudweb.service('QueueService', ['$rootScope', '$q', 'HttpService', function ($rootScope, $q, httpService) {
  var deferred = $q.defer();	
  var queues = [];
  var mine = [];
  
  this.getQueue = function(xpid) {
	for(queue in queues){
		if(queues[queue].xpid == xpid){
			return queues[queue];
		}
	}
  };

  this.getQueues = function () {
	// waits until data is present before sending back
	return deferred.promise;
  };
  
  this.getUserQueues = function(xpid) {
	var myQueues = [];
	
	for (q in queues) {
        if (queues[q].members) {
			for (i = 0; i < queues[q].members.length; i++) {
				if (queues[q].members[i] && queues[q].members[i].contactId == xpid) {
					myQueues.push(queues[q]);
					break;
				}
			}
        }
	}
	
	return myQueues;
  };
  
  this.getMyQueues = function() {
	return mine;  
  };

  var formatData = function () {
	if (queues.length > 0 && queues[0].members)
	  deferred.resolve(queues);
		
    // format data that controller needs
    return {
      queues: queues,
	  mine: mine
    };
  };

  $rootScope.$on("queues_synced", function (event, data) {
    queues = data;

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
	
	httpService.getFeed('queue_stat_calls');
	httpService.getFeed('queue_members');
  });

  $rootScope.$on("queue_members_synced", function (event, data) {
    if (queues !== undefined){
	  mine = [];
	  
      for (i = 0; i < queues.length; i++) {
        queues[i].members = [];
        for (key in data) {		  
		  // add to member list
          if (data[key].queueId == queues[i].xpid) {
            queues[i].members.push(data[key]);
			
			// mark as mine
			if (data[key].contactId == $rootScope.myPid)
				mine.push(queues[i]);
          }
        }
      }
	  
	  httpService.getFeed('queue_members_status');
    }
  });

  $rootScope.$on("queue_members_status_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {
	  queues[i].loggedInMembers = 0;
	  queues[i].loggedOutMembers = 0;

      if (queues[i].members && queues[i].members.length > 0) {
        for (j = 0; j < queues[i].members.length; j++) {
          for (key in data) {
            if (data[key].xpid == queues[i].members[j].xpid) {
              queues[i].members[j].status = data[key];
			  
			  // logged totals
			  if (queues[i].members[j].status && queues[i].members[j].status.status == 'login')
				  queues[i].loggedInMembers++;
			  else
				  queues[i].loggedOutMembers++;
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

}]);
