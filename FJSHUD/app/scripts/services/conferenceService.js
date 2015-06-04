hudweb.service('ConferenceService', ['$q', '$rootScope', '$location', 'ContactService', 'HttpService', function($q, $rootScope, $location, contactService, httpService) {
	var service = this;
	var deferred = $q.defer();
	
	var conferences = [];
	var totals = {occupied: 0, talking: 0, all: 0};

	service.getConference = function(conferenceId){
		for (var i = 0, len = conferences.length; i < len; i++) {
			if(conferences[i].xpid == conferenceId){
				return conferences[i];
			}
		}
		
		return null;
	};
	
	service.getConferences = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};

 	service.isMember = function(conference,contactId){
 		if(conference.members){
 			for (var i = 0, len = conference.members.length; i < len; i++) {
 				if(conference.members[i].contactId == contactId){
 					return true;
 				}
 			}
 		}

 		return false;
	};
	
	var formatData = function() {
		// format data that controller needs
		return {
			conferences: conferences,
			totals: totals
		};
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on("conferences_synced",function(event, data){
		// first time
		if (conferences.length == 0) {
			conferences = data;
			deferred.resolve(formatData());
				
			// add avatar function
			for (var i = 0, len = conferences.length; i < len; i++) {
				conferences[i].members = [];
				
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
					
					conferences[conferences.length-1].members = [];
					
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
		httpService.getFeed('conferencepermissions');
	});

	$rootScope.$on("conferencemembers_synced",function(event,data){
		totals.occupied = 0;
		totals.talking = 0;
		totals.all = 0;
		
		for (var c = 0, cLen = conferences.length; c < cLen; c++) {
			var conference = conferences[c];
			
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				// member dropped out
				if (data[i].xef001type == 'delete') {
					for (var m = 0, mLen = conference.members.length; m < mLen; m++) {
						if (conference.members[m].xpid == data[i].xpid) {
							conference.members.splice(m, 1);
							data.splice(i, 1);
							iLen--;
							
							break;
						}
					}
				}
				// member exists
				else if (data[i].fdpConferenceId == conference.xpid) {	
					totals.all++;
							
					if (!data[i].muted)
						totals.talking++;
						
					var match = false;
					
					// update or add
					for (var m = 0, mLen = conference.members.length; m < mLen; m++) {
						if (conference.members[m].xpid == data[i].xpid) {
							conference.members[m] = angular.extend(conference.members[m], data[i]);
							
							match = true;
							break;
						}
					}
					
					if (!match) {
						data[i].fullProfile = contactService.getContact(data[i].contactId);
						conferences[c].members.push(data[i]);
								
						// redirect self
						if ($rootScope.myPid == data[i].contactId)
							$location.path('/conference/' + data[i].fdpConferenceId);
					}
				}
			}
			
			if (conference.members.length > 0)
				totals.occupied++;
		}
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
	});
}]);