hudweb.service('QueueService', ['$rootScope', '$q', 'ContactService', 'HttpService', function ($rootScope, $q, contactService, httpService) {
	var deferred = $q.defer();	
	var queues = [];
	var mine = [];
	var total = {};
	var myLoggedIn = 0;
	var reasons = [];
	
	this.getQueue = function(xpid) {
		for (var i = 0, len = queues.length; i < len; i++) {
			if (queues[i].xpid == xpid) {
				return queues[i];
			}
		}
		
		return null;
	};

	this.getQueues = function () {
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	this.getUserQueues = function(xpid) {
		var userqueues = [];
		
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			var queue = queues[q];
			
			if (queue.members) {
				for (var m = 0, mLen = queue.members.length; m < mLen; m++) {
					if (queue.members[m] && queue.members[m].contactId == xpid) {
						userqueues.push(queue);
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
		// first time
		if (queues.length == 0) {
			queues = data;
			deferred.resolve(queues);
			
			// add avatars
			for (var i = 0, len = queues.length; i < len; i++) {
				queues[i].getAvatar = function (index, size) {
					if (this.members && this.members[index] !== undefined)
						return httpService.get_avatar(this.members[index].contactId, size, size);
					else
						return 'img/Generic-Avatar-' + size + '.png';
				};
			}
		}
		else {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var match = false;
					
				for (var q = 0, qLen = queues.length; q < qLen; q++) {
					if (queues[q].xpid == data[i].xpid) {
						// queue was deleted
						if (data[i].xef001type == 'delete') {
							queues.splice(q, 1);
							qLen--;
						}
						// regular update
						else
							angular.extend(queues[q], data[i]);
						
						match = true;
						break;
					}
				}
				
				// add new queue
				if (!match) {
					queues.push(data[i]);
					
					// add avatar
					queues[queues.length-1].getAvatar = function (index, size) {
						if (this.members && this.members[index] !== undefined)
							return httpService.get_avatar(this.members[index].contactId, size, size);
						else
							return 'img/Generic-Avatar-' + size + '.png';
					};
				}
			}
		}
		
		// retrieve child data	
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
	
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].xpid == queues[q].xpid) {
					queues[q].info = data[i];
			
					// add up overall totals
					total.active += data[i].active;
					total.waiting += data[i].waiting;
					total.calls += (data[i].completed + data[i].abandon);
					
					break;
				}
			}
		
			// didn't find one, so create empty data
			if (!queues[q].info) {
				queues[q].info = {
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
		var now = new Date().getTime();
		
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			queues[q].calls = [];
			queues[q].longestWait = now;
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].queueId == queues[q].xpid) {
					queues[q].calls.push(data[i]);
					
					// find longest wait/hold
					if (data[i].startedAt < queues[q].longestWait)
						queues[q].longestWait = data[i].startedAt;
				}
			}
			
			// no change, so set to zero
			if (queues[q].longestWait == now)
				queues[q].longestWait = 0;
		}
	
		$rootScope.$evalAsync($rootScope.$broadcast('queues_updated', formatData()));
	});
	
	/**
		MEMBER DATA
	*/

	$rootScope.$on("queue_members_synced", function (event, data) {
		if (queues.length > 0){
			mine.splice(0, mine.length);
		
			for (var q = 0, qLen = queues.length; q < qLen; q++) {
				queues[q].members = [];
				
				for (var i = 0, iLen = data.length; i < iLen; i++) {		
					// add to member list
					if (data[i].queueId == queues[q].xpid) {
						data[i].fullProfile = contactService.getContact(data[i].contactId);
						queues[q].members.push(data[i]);
			
						// mark as mine
						if (data[i].contactId == $rootScope.myPid)
							mine.push(queues[q]);
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
	
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			var queue = queues[q];
			
			queue.loggedInMembers = 0;
			queue.loggedOutMembers = 0;

			if (queue.members && queue.members.length > 0) {
				total.members += queue.members.length;
			
				// current member list
				for (var m = 0, mLen = queue.members.length; m < mLen; m++) {
					// member list from sync
					for (var i = 0, iLen = data.length; i < iLen; i++) {
						if (data[i].xpid == queue.members[m].xpid) {
							queue.members[m].status = data[i];
				
							// logged totals
							if (queue.members[m].status.status.indexOf('login') != -1) {
								queue.loggedInMembers++;
								total.loggedIn++;
								
								if (queue.members[m].contactId == $rootScope.myPid)
									myLoggedIn++;
							}
							else
								queue.loggedOutMembers++;
							
							// attach "me" status to parent object
							if (queue.members[m].contactId == $rootScope.myPid)
								queue.me = queue.members[m];
							
							break;
						}
					}
				}
			}
		}

		httpService.getFeed('queue_members_stat');
	});
	
	$rootScope.$on('queue_members_stat_synced', function(event, data) {
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			var queue = queues[q];
			
			if (queue.members) {
				for (var m = 0, mLen = queue.members.length; m < mLen; m++) {
					// attach stats to each queue agent
					for (var i = 0, iLen = data.length; i < iLen; i++) {
						if (queue.members[m].xpid == data[i].xpid) {
							queue.members[m].stats = data[i];
							break;
						}
					}
					
					// no data, so set to zero
					if (!queue.members[m].stats) {
						queue.members[m].stats = {
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
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			var queue = queues[q];
			
			if (queue.members) {
				for (var m = 0, mLen = queue.members.length; m < mLen; m++) {
					// attach call status
					for (var i = 0, iLen = data.length; i < iLen; i++) {
						if (queue.members[m].xpid == data[i].xpid) {
							queue.members[m].call = data[i];
							break;
						}
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
