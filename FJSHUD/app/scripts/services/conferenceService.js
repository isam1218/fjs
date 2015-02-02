hudweb.service('ConferenceService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {
	var conferences = [];

	this.getConference = function(conferenceId){
		for(conference in conferences){
			if(conferences[conference].xpid == conferenceId){
				return conferences[conference];
			}
		}
	};
	
	this.getConferences = function() {
		// wake shared worker
		httpService.getFeed("conferences");
		httpService.getFeed("conferencestatus");
		httpService.getFeed("conferencemembers");
		httpService.getFeed("conferencepermissions");
		
		return conferences;
	};
	
	this.getConferenceRecordings = function(conferenceId){
		for(conference in conferences){

		}
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

	$rootScope.$on("conferences_synced",function(event,data){
		if (conferences.length  < 1 && data) {
			conferences = data;
			
			// pull feed again in case shared worker got ahead of us
			httpService.getFeed('server');
		}
		
		$rootScope.$broadcast('conferences_updated', conferences);
	});

	$rootScope.$on("conferencemembers_synced",function(event,data){
		
		for(conference in conferences){
			conferences[conference].members = [];
			for(key in data){
				if(data[key].fdpConferenceId == conferences[conference].xpid){
					conferences[conference].members.push(data[key]);
				}
			}
		}
		$rootScope.$broadcast('conferences_updated', conferences);

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
		$rootScope.$broadcast('conferences_updated', conferences);

	});

	$rootScope.$on("conferencestatus_synced",function(event,data){
		
		for(conference in conferences){

			for(key in data){
				if(data[key].xpid == conferences[conference].xpid){
					conferences[conference].status = data[key];
				}
			}
		}
		$rootScope.$broadcast('conferences_updated', conferences);
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
		$rootScope.$broadcast('conferences_updated', conferences);
	});
	
	$rootScope.$on("conferencepermissions_synced", function(event, data) {
		for (i = 0; i < conferences.length; i++) {
			for (key in data) {
				if (data[key].xpid == conferences[i].xpid)
					conferences[i].permissions = data[key].permissions;
			}
		}
		
		$rootScope.$broadcast('conferences_updated', conferences);
	});
}]);