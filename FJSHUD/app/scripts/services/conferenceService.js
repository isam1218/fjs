hudweb.service('ConferenceService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {
	var deferred = $q.defer();
	var conferences = [];	

	this.getConference = function(conferenceId){
		for(conference in conferences){
			if(conferences[conference].xpid == conferenceId){
				return conferences[conference];
			}
		}
	};
	
	this.getConferences = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};

 	var conferenceHasMember = function(conference,contactId){
 		if(conference.members){
 			for(member in conference.members){
 				if(conference.members[member].contactId == contactId){
 					return true;
 				}
 			}
 		}

 		return false;
	};

	var containsConferenceRecording = function(conference, callrecording){
		callrecordings = conference.callrecordings;
		exist = false;
		for(callrecording in callrecordings){
			if(callrecordings[callrecording].xpid == callrecording.xpid){
				exist = true;
				return exist;
			}
		}

		return exist;
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on("conferences_synced",function(event, data){
		conferences = data;
		deferred.resolve(conferences);
			
		// pull feed again in case shared worker got ahead of us
		httpService.getFeed('server');
				
		// add avatar function
		for (i = 0; i < conferences.length; i++) {
			conferences[i].getAvatar = function(index, size) {
				if (this.members) {
					if (this.members[index] !== undefined) {
						var xpid = this.members[index].contactId;
						return httpService.get_avatar(xpid, size, size);
					}
					else
						return 'img/Generic-Avatar-' + size + '.png';
				}
				else
					return 'img/Generic-Avatar-' + size + '.png';
			};
		}
		
		httpService.getFeed('conferencemembers');
		httpService.getFeed('server');
		httpService.getFeed('conferencestatus');
		httpService.getFeed('conferencerecording');
		httpService.getFeed('conferencepermissions');
	});

	$rootScope.$on("conferencemembers_synced",function(event,data){
		for(conference in conferences){
			conferenceTemp = conferences[conference];
			if(!conferences[conference].members){
				 conferences[conference].members = [];	
			}
			for(key in data){

				if(data[key].xef001type == "delete"){

					if(conferences[conference].members && conferences[conference].members.length > 0){
						for( i in conferenceTemp.members){
							if(conferenceTemp.members[i].xpid == data[key].xpid){
								conferences[conference].members.splice(i,1);
							}
						}
					}

				}else if(data[key].fdpConferenceId == conferences[conference].xpid){
					if(!conferenceHasMember(conferences[conference],data[key].contactId)){
						conferences[conference].members.push(data[key]);
					}
				}
			}
		}
		
		$rootScope.loaded.conferences = true;
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});

	$rootScope.$on("server_synced",function(event,data){
		for(conference in conferences){
			conferences[conference].location = "";
			for(key in data){
				if(data[key].xpid == conferences[conference].serverNumber){
					conferences[conference].location = data[key].name;
				}
			}
		}
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));

	});

	$rootScope.$on("conferencestatus_synced",function(event,data){
		for(conference in conferences){
			for(key in data){
				if(data[key].xpid == conferences[conference].xpid){
					conferences[conference].status = data[key];
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});

	$rootScope.$on("conferencerecording_synced",function(event,data){
		for(conference in conferences){
			conferences[conference].callrecordings = [];
			
			for(key in data){
				if(data[key].conferenceId == conferences[conference].xpid){
					if(!containsConferenceRecording(conferences[conference], data[key])){
						conferences[conference].callrecordings.push(data[key]);
					}
				}
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});
	
	$rootScope.$on("conferencepermissions_synced", function(event, data) {
		for (i = 0; i < conferences.length; i++) {
			for (key in data) {
				if (data[key].xpid == conferences[i].xpid)
					conferences[i].permissions = data[key].permissions;
			}
		}
		
		$rootScope.$evalAsync($rootScope.$broadcast('conferences_updated', conferences));
	});
}]);