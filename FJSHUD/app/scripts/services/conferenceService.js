hudweb.service('ConferenceService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {
	var deferred = $q.defer();
	var conferences = [];	

	this.getConference = function(conferenceId){
		for (var i = 0, len = conferences.length; i < len; i++) {
			if(conferences[i].xpid == conferenceId){
				return conferences[i];
			}
		}
		
		return null;
	};
	
	this.getConferences = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};

 	var conferenceHasMember = function(conference,contactId){
 		if(conference.members){
 			for (var i = 0, len = conference.members.length; i < len; i++) {
 				if(conference.members[i].contactId == contactId){
 					return true;
 				}
 			}
 		}

 		return false;
	};

	var containsConferenceRecording = function(conference, callrecording){
		var callrecordings = conference.callrecordings;
		
		for (var i = 0, len = callrecordings.length; i < len; i++) {
			if(callrecordings[i].xpid == callrecording.xpid){
				return true;
			}
		}

		return false;
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on("conferences_synced",function(event, data){
		// first time
		if (conferences.length == 0) {
			conferences = data;
			deferred.resolve(conferences);
				
			// add avatar function
			for (var i = 0, len = conferences.length; i < len; i++) {
				conferences[i].getAvatar = function(index, size) {
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
					
				for (var c = 0, cLen = conferences.length; c < cLen; c++) {
					if (conferences[c].xpid == data[i].xpid) {
						// conference was deleted
						if (data[i].xef001type == 'delete') {
							conferences.splice(c, 1);
							cLen--;
						}
						// regular update
						else
							angular.extend(conferences[c], data[i]);
						
						match = true;
						break;
					}
				}
				
				// add new conference
				if (!match) {
					conferences.push(data[i]);
					
					// add avatar
					conferences[conferences.length-1].getAvatar = function (index, size) {
						if (this.members && this.members[index] !== undefined)
							return httpService.get_avatar(this.members[index].contactId, size, size);
						else
							return 'img/Generic-Avatar-' + size + '.png';
					};
				}
			}
		}
		
		// retrieve child data
		httpService.getFeed('conferencemembers');
		httpService.getFeed('server');
		httpService.getFeed('conferencestatus');
		httpService.getFeed('conferencerecording');
		httpService.getFeed('conferencepermissions');
	});

	$rootScope.$on("conferencemembers_synced",function(event,data){
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			// member dropped out
			if (data[i].xef001type == 'delete') {
				for (var c = 0, cLen = conferences.length; c < cLen; c++) {
					var conference = conferences[c];
					
					if (conference.members && conference.members.length > 0) {
						// find member and remove
						for (var m = 0, mLen = conference.members.length; m < mLen; m++) {
							if (conference.members[m].xpid == data[i].xpid) {
								conference.members.splice(m, 1);
								break;
							}
						}
					}
				}
			}
			// member joined
			else {
				for (var c = 0, cLen = conferences.length; c < cLen; c++) {
					var conference = conferences[c];
					
					if (!conference.members)
						conference.members = [];
					
					if (data[i].fdpConferenceId == conferences[c].xpid) {
						// isn't already in
						if (!conferenceHasMember(conferences[c], data[i].contactId))
							conferences[c].members.push(data[i]);
						
						break;
					}
				}
			}
		}
		
		$rootScope.loaded.conferences = true;
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});

	$rootScope.$on("server_synced",function(event,data){
		for (var c = 0, cLen = conferences.length; c < cLen; c++) {
			conferences[c].location = "";
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].xpid == conferences[c].serverNumber){
					conferences[c].location = data[i].name;
					break;
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});

	$rootScope.$on("conferencestatus_synced",function(event,data){
		for (var c = 0, cLen = conferences.length; c < cLen; c++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if(data[i].xpid == conferences[c].xpid){
					conferences[c].status = data[i];
					break;
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});

	$rootScope.$on("conferencerecording_synced",function(event,data){
		for (var c = 0, cLen = conferences.length; c < cLen; c++) {
			conferences[c].callrecordings = [];
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].conferenceId == conferences[c].xpid){
					if (!containsConferenceRecording(conferences[c], data[i]))
						conferences[c].callrecordings.push(data[i]);
					
					break;
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});
	
	$rootScope.$on("conferencepermissions_synced", function(event, data) {
		for (var c = 0, cLen = conferences.length; c < cLen; c++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (data[i].xpid == conferences[c].xpid) {
					conferences[c].permissions = data[i].permissions;
					break;
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});
}]);