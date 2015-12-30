hudweb.service('QueueService', ['$rootScope', '$q', 'ContactService', 'HttpService', 'NtpService','SettingsService', function ($rootScope, $q, contactService, httpService, ntpService,settingsService) {
	var deferred = $q.defer();	
	var queues = [];
	var mine = [];
	var total = {};
	var agents = {};
	var myLoggedIn = 0;
	var reasons = [];
	var selectedFlag = '';
	
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
	
	this.setSelected = function(flag, name, qid){
		selectedFlag = {};
		selectedFlag.flag = flag;
		selectedFlag.name = name;
		selectedFlag.qid = qid;
	};
	
	this.getSelected = function(){		
		return selectedFlag;		
	};

	var formatData = function () {
		// format data that controller needs
		return {
			queues: queues,
			mine: mine,
			total: total,
			reasons: reasons
		};
	};
	
	var syncWatch = $rootScope.$watch('isFirstSync', function(val) {
		// resolve queue data only after first sync is complete
		if (val === false) {
			deferred.resolve(formatData());
			syncWatch();
		}
	});
	
	/**
		QUEUE SYNC DATA
	*/

	$rootScope.$on("queues_synced", function (event, data) {
		// first time
		if (queues.length == 0) {
			queues = data;
			
			// add child data
			for (var i = 0, len = queues.length; i < len; i++) {
				queues[i].calls = [];
				queues[i].members = [];
				queues[i].longestWait = 0;
				queues[i].longestWaitDuration = 0;
				queues[i].longestActive = 0;
				
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
				if (!match && data[i].xef001type != 'delete') {
					queues.push(data[i]);
					
					queues[queues.length-1].calls = [];
					queues[queues.length-1].members = [];
					
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
		/*httpService.getFeed('queue_stat_calls');
		httpService.getFeed('queue_call');
		httpService.getFeed('queue_members');
		httpService.getFeed('queuepermissions');*/
	});

	$rootScope.$on('queuepermissions_synced', function (event, data){
		$rootScope.in_queue = false;
		for (var i = 0, iLen = queues.length; i < iLen; i++){
			for (var j = 0, jLen = data.length; j < jLen; j++){
				if (data[j].xpid == queues[i].xpid){
					queues[i].permissions = data[j];
					break;
				}
				
			}
			for(var n = 0, nLen = queues[i].members.length; n < nLen; n++)
			{
				if(queues[i].members[n].fullProfile && queues[i].members[n].fullProfile.xpid == $rootScope.myPid)
					$rootScope.in_queue = true;
			}
			
			if(queues[i].me)
				$rootScope.in_queue = true;
		}
		
		//$rootScope.in_queue = false;
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
	});
	
	$rootScope.$on('queue_call_synced', function(event, data) {
		var timestamp = ntpService.calibrateTime(new Date().getTime());
		
		for (var q = 0, qLen = queues.length; q < qLen; q++) {
			queues[q].calls.splice(0, queues[q].calls.length);
			queues[q].longestWait = timestamp;
			queues[q].longestActive = timestamp;
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].queueId == queues[q].xpid) {
					queues[q].calls.push(data[i]);
					
					// attach profile
					if (data[i].contactId)
						queues[q].calls[queues[q].calls.length-1].fullProfile = contactService.getContact(data[i].contactId);
					
					// find longest active/hold
					if (data[i].taken) {
						if (data[i].startedAt < queues[q].longestActive)
							queues[q].longestActive = data[i].startedAt;
					}
					else {
						if (data[i].startedAt < queues[q].longestWait)
							queues[q].longestWait = data[i].startedAt;
					}
						
					// attach ringing agent
					if (data[i].agentContactId)
						data[i].agent = contactService.getContact(data[i].agentContactId);
				}
			}
			
			// no change, so set to zero
			if (queues[q].longestWait == timestamp) {
				queues[q].longestWait = 0;
				queues[q].longestWaitDuration = 0;
			}
			else
				queues[q].longestWaitDuration = timestamp - queues[q].longestWait;
			
			if (queues[q].longestActive == timestamp)
				queues[q].longestActive = 0;
		}
	});
	
	/**
		MEMBER DATA
	*/

	$rootScope.$on("queue_members_synced", function (event, data) {
		if (queues.length > 0){
			mine.splice(0, mine.length);
		
			for (var q = 0, qLen = queues.length; q < qLen; q++) {
				queues[q].members.splice(0, queues[q].members.length);
				
				for (var i = 0, iLen = data.length; i < iLen; i++) {		
					// add to member list
					if (data[i].queueId == queues[q].xpid) {
						data[i].fullProfile = contactService.getContact(data[i].contactId);
						queues[q].members.push(data[i]);
			
						// mark as mine
						if (data[i].contactId == $rootScope.myPid){
							
							if(settingsService.getSetting('HUDw_QueueNotificationsLW_'+ queues[q].xpid) == undefined){
								settingsService.setSetting('HUDw_QueueNotificationsLW_'+ queues[q].xpid,"true");
							}
							if(settingsService.getSetting('HUDw_QueueAlertsLW_'+ queues[q].xpid) == undefined){
								settingsService.setSetting('HUDw_QueueAlertsLW_'+ queues[q].xpid,"true");
							}

							if(settingsService.getSetting('HUDw_QueueNotificationsAb_'+ queues[q].xpid) == undefined){
								settingsService.setSetting('HUDw_QueueNotificationsAb_'+ queues[q].xpid,"true");
							}

							if(settingsService.getSetting('HUDw_QueueAlertsAb_'+ queues[q].xpid) == undefined){
								settingsService.setSetting('HUDw_QueueAlertsAb_'+ queues[q].xpid,"true");
							}
							
							mine.push(queues[q]);
						}
					}
				}
			}
		
			// pull member child data
			/*httpService.getFeed('queue_members_status');
			httpService.getFeed('queue_members_stat');
			httpService.getFeed('queuemembercalls');*/
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
				// current member list
				for (var m = 0, mLen = queue.members.length; m < mLen; m++) {
					// prepare for total count
					agents[queue.members[m].contactId] = false;
					
					// member list from sync
					for (var i = 0, iLen = data.length; i < iLen; i++) {
						if (data[i].xpid == queue.members[m].xpid) {
							queue.members[m].status = data[i];
				
							// logged totals
							if (queue.members[m].status.status.indexOf('login') != -1) {
								agents[queue.members[m].contactId] = true;
								
								queue.loggedInMembers++;
								
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
		
		// finalize totals
		for (var key in agents) {
			total.members++;
			
			if (agents[key] === true)
				total.loggedIn++;
		}
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
	});
	
	$rootScope.$on('queuelogoutreasons_synced', function(event, data) {
		reasons = data;
	});
}]);
