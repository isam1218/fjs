hudweb.service('QueueService', ['$rootScope', '$q', 'HttpService', function ($rootScope, $q, httpService) {
  var deferred = $q.defer();	
  var queues = [];
  var mine = [];
  var total = {};
  var myLoggedIn = 0;
  
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
	var userqueues = [];
	
	for (q in queues) {
        if (queues[q].members) {
			for (i = 0; i < queues[q].members.length; i++) {
				if (queues[q].members[i] && queues[q].members[i].contactId == xpid) {
					userqueues.push(queues[q]);
					break;
				}
			}
        }
	}
	
	return userqueues;
  };
  
  this.getMyQueues = function() {
	return {
		queues: mine,
		loggedIn: myLoggedIn
	};
  };

  var formatData = function () {
	if (queues.length > 0 && queues[0].members)
		deferred.resolve(queues);
		
    // format data that controller needs
    return {
      queues: queues,
	  mine: mine,
	  total: total
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
	total.members = 0;
	total.loggedIn = 0;
	myLoggedIn = 0;
	
    for (i = 0; i < queues.length; i++) {
	  queues[i].loggedInMembers = 0;
	  queues[i].loggedOutMembers = 0;

      if (queues[i].members && queues[i].members.length > 0) {
		total.members += queues[i].members.length;
		  
        for (j = 0; j < queues[i].members.length; j++) {
          for (key in data) {
            if (data[key].xpid == queues[i].members[j].xpid) {
              queues[i].members[j].status = data[key];
			  
			  // logged totals
			  if (queues[i].members[j].status.status.indexOf('login') != -1) {
				  queues[i].loggedInMembers++;
				  total.loggedIn++;
				  
				  if (queues[i].members[j].contactId == $rootScope.myPid)
					  myLoggedIn++;
			  }
			  else
				  queues[i].loggedOutMembers++;
            }
          }
        }
      }
    }

    $rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
  });

  $rootScope.$on("queue_stat_calls_synced", function (event, data) {
	total.active = 0;
	total.waiting = 0;
	total.calls = 0;
	
    for (i = 0; i < queues.length; i++) {
      for (key in data) {
        if (data[key].xpid == queues[i].xpid) {
          queues[i].info = data[key];
		  
		  // add up overall totals
		  total.active += data[key].active;
		  total.waiting += data[key].waiting;
		  total.calls += (data[key].completed + data[key].abandon);
        }
      }
    }
	
    $rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
  });

  $rootScope.$on("queuemembercalls_synced", function (event, data) {
    for (i = 0; i < queues.length; i++) {
      for (key in data) {
        if (data[key].xpid == queues[i].xpid) {
          queues[i].callLogs = data[key];
        }
      }
    }
    $rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
  });
}]);
