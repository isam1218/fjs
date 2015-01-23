fjs.hud.conferenceService = function($q, $rootScope, myHttpService) {


	var conferences = [];

	
	var formatData = function() {
		// format data that controller needs
		return {
			conferences: conferences,
		};
	};
	
/*
contactId: "1000015ad_1384827"
displayName: "Glenn User"
fdpConferenceId: "1000015ad_1"
muted: false
phone: "7340"
ring: false
started: 1422039133224
xef001id: "32"
xef001iver: "105"
xef001type: "push"
xpid: "1000015ad_32"*/

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
}