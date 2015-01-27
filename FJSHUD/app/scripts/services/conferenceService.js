fjs.hud.conferenceService = function($q, $rootScope, myHttpService) {


	var conferences = [];

	
	var formatData = function() {
		// format data that controller needs
		return {
			conferences: conferences,
		};
	};

	this.getConference = function(conferenceId){
		for(conference in conferences){
			if(conferences[conference].xpid == conferenceId){
				return conferences[conference];
			}
		}
	}
	
	this.getConferenceRecordings = function(conferenceId){
		for(conference in conferences){

		}
	}

	$rootScope.$on("conferences_synced",function(event,data){
		if(conferences.length  < 1 && data){
			conferences = data;
		}
		$rootScope.$broadcast('conferences_updated', formatData());

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
		$rootScope.$broadcast('conferences_updated', formatData());

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
		$rootScope.$broadcast('conferences_updated', formatData());

	});

	$rootScope.$on("conferencestatus_synced",function(event,data){
		
		for(conference in conferences){

			for(key in data){
				if(data[key].xpid == conferences[conference].xpid){
					conferences[conference].status = data[key];
				}
			}
		}
		$rootScope.$broadcast('conferences_updated', formatData());
	});

	$rootScope.$on("conferencerecording_synced",function(event,data){
		
		for(conference in conferences){
			conferences[conference].callrecordings = []
			
			for(key in data){
				if(data[key].conferenceId == conferences[conference].xpid){
					if(!containsConferenceRecording(conferences[conference], data[key])){
						conferences[conference].callrecordings.push(data[key]);
					}
				}
			}
		}
		$rootScope.$broadcast('conferences_updated', formatData());
	});

	containsConferenceRecording = function(conference, callrecording){
		callrecordings = conference.callrecordings;
		exist = false;
		for(callrecording in callrecordings){
			if(callrecordings[callrecording].xpid == callrecording.xpid){
				exist = true;
				return exist;
			}
		}

		return exist;
	}
}