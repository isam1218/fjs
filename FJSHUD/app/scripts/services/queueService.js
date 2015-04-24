hudweb.service('QueueService', ['$rootScope', '$q', 'HttpService', function ($rootScope, $q, httpService) {
	var deferred = $q.defer();	
	var queues = [];
	var mine = [];
	var total = {};
	var myLoggedIn = 0;
	var reasons = [];
	
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
	
	this.getReasons = function() {
		return reasons;
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
	
	/**
		QUEUE SYNC DATA
	*/

	$rootScope.$on("queues_synced", function (event, data) {
		queues = data;
		// console.log('queues = ', queues);
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
		httpService.getFeed('queue_call');
		httpService.getFeed('queue_members');
		httpService.getFeed('queuepermissions');
	});

	$rootScope.$on('queuepermissions_synced', function (event, data){
		for (i = 0; i < queues.length; i++){
			for (var j = 0; j < data.length; j++){
				if (data[j].xpid == queues[i].xpid){
					queues[i].permissions = data[j];
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
				// console.log('!!! - ', data);
				if (data[key].xpid == queues[i].xpid) {
					queues[i].info = data[key];
			
					// add up overall totals
					total.active += data[key].active;
					total.waiting += data[key].waiting;
					total.calls += (data[key].completed + data[key].abandon);
				}
			}
		
			// didn't find one, so create empty data
			if (!queues[i].info) {
				queues[i].info = {
					waiting: 0,
					esa: 0,
					avgTalk: 0,
					abandon: 0,
					complete: 0,
					abandonPercent: 0,
					active: 0
				};
			}
		}
	
		$rootScope.loaded.queues = true;
		$rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
	});
	
	$rootScope.$on('queue_call_synced', function(event, data) {
		for (i = 0; i < queues.length; i++) {
			queues[i].calls = [];
			
			for (key in data) {
				if (data[key].queueId == queues[i].xpid)
					queues[i].calls.push(data[key]);
			}
		}
	
		$rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
	});

	// $rootScope.$on('queuepermissions_synced', function(event, data){
	// 	for (i = 0; i < queues.length; i++){

	// 	}
	// })
	
	/**
		MEMBER DATA
	*/

	$rootScope.$on("queue_members_synced", function (event, data) {
		if (queues.length > 0){
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
							
							// attach "me" status to parent object
							if (queues[i].members[j].contactId == $rootScope.myPid)
								queues[i].me = queues[i].members[j];
						}
					}
				}
			}
		}

		httpService.getFeed('queue_members_stat');
	});
	
	$rootScope.$on('queue_members_stat_synced', function(event, data) {
		for (i = 0; i < queues.length; i++) {
			if (queues[i].members) {
				for (m = 0; m < queues[i].members.length; m++) {
					// attach stats to each queue agent
					for (key in data) {
						if (queues[i].members[m].xpid == data[key].xpid)
							queues[i].members[m].stats = data[key];
					}
					
					// no data, so set to zero
					if (!queues[i].members[m].stats) {
						queues[i].members[m].stats = {
							lastCallTimestamp: 0,
							callsHandled: 0,
							avgTalkTime: 0
						};
					}
				}
			}
		}
	
		httpService.getFeed('queuemembercalls');
		$rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
	});

	$rootScope.$on("queuemembercalls_synced", function (event, data) {
		for (i = 0; i < queues.length; i++) {
			if (queues[i].members) {
				for (m = 0; m < queues[i].members.length; m++) {
					for (key in data) {
						if (queues[i].members[m].xpid == data[key].xpid)
							queues[i].members[m].call = data[key];
					}
				}
			}
		}
	
		$rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
	});
	
	$rootScope.$on('queuelogoutreasons_synced', function(event, data) {
		reasons = data;
	});
}]);
